// Git 操作服务

import git from 'isomorphic-git';
import fs from 'fs';
import { execSync } from 'child_process';
import type { GitStatus, FileNode } from '@/shared/types';

import type { LineInfo } from '@/shared/types';

export class GitService {
  async getStatus(repoPath: string): Promise<GitStatus> {
    try {
      // Get current branch using isomorphic-git
      // @ts-ignore isomorphic-git type mismatch issue
      const branch = await git.currentBranch({ fs, dir: repoPath, gitdir: repoPath + '/.git' });

      // Use native git status for accurate parsing that matches user expectation
      const output = execSync('git status --porcelain', { cwd: repoPath, encoding: 'utf-8' });
      const lines = output.trim().split('\n').filter(line => line.trim());

      const files: GitStatus['files'] = {};

      for (const line of lines) {
        // Format: "XY filepath" where X=index, Y=working tree
        // X (first char) = index status. If X is not space/?, file is staged
        // We just care about the final state in working tree
        const trimmed = line.trim();
        if (!trimmed) continue;

        const code = trimmed.substring(0, 2);
        const indexCode = code[0];
        let filePath = trimmed.substring(2).trim();

        // Remove quotes if present (for files with spaces)
        if (filePath.startsWith('"') && filePath.endsWith('"')) {
          filePath = filePath.slice(1, -1);
        }

        // Normalize to forward slash for consistency
        filePath = filePath.replace(/\\/g, '/');

        // Determine status based on git status output
        let status: FileNode['status'];
        if (code.includes('U')) {
          status = 'conflict';
        } else if (code === '??') {
          // Untracked = new file
          status = 'new';
        } else if (code.includes('A')) {
          // Added = new
          status = 'new';
        } else if (code.includes('M')) {
          // Modified
          status = 'modified';
        } else if (code.includes('D')) {
          // Deleted
          status = 'deleted';
        } else if (code.includes('R')) {
          // Renamed = treated as modified
          status = 'modified';
        } else {
          status = 'normal';
        }

        // Check if file is staged (index has change, first character is not space)
        const staged = indexCode !== ' ' && indexCode !== '?';

        files[filePath] = { status, staged };
      }

      return {
        branch: branch || '',
        hasUncommittedChanges: lines.length > 0,
        files,
      };
    } catch (e) {
      console.error('Failed to get git status:', e);
      return {
        branch: '',
        hasUncommittedChanges: false,
        files: {},
      };
    }
  }

  async getFileDiff(repoPath: string, filePath: string): Promise<LineInfo[]> {
    try {
      // Read current file content
      const fullPath = `${repoPath}/${filePath}`;
      const currentContent = fs.readFileSync(fullPath, 'utf-8');
      let currentLines = currentContent.split('\n');
      // Ensure we always end with proper line ending
      if (currentContent.endsWith('\n')) {
        currentLines = currentLines.slice(0, -1);
      }

      // For untracked new files: all lines are added
      const isUntracked = execSync(`git ls-files --others --exclude-standard "${filePath}"`, {
        cwd: repoPath,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();

      if (isUntracked) {
        return currentLines.map(content => ({
          content,
          type: 'added' as const,
        }));
      }

      // Get diff from git
      let diffOutput: string;
      try {
        diffOutput = execSync(`git diff HEAD -- "${filePath}"`, {
          cwd: repoPath,
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'ignore'],
        });
      } catch (e) {
        // git diff returns non-zero if there are differences, which is expected
        diffOutput = (e as any).stdout || '';
      }

      // If no diff, return all lines unchanged
      if (!diffOutput.trim()) {
        return currentLines.map(content => ({
          content,
          type: 'unchanged' as const,
        }));
      }

      // Parse diff to find which lines are added
      // We start with all lines unchanged, then mark added lines based on diff
      const lineStatuses: ('unchanged' | 'added')[] = Array(currentLines.length).fill('unchanged');

      // Diff format: @@ -old_start,old_count +new_start,new_count @@
      // Lines starting with + are added in working copy
      const diffLines = diffOutput.split('\n');
      let currentNewLine = 0;

      for (const line of diffLines) {
        // Skip header lines
        if (line.startsWith('diff --git') || line.startsWith('index ') ||
            line.startsWith('--- ') || line.startsWith('+++ ') ||
            line.startsWith('@@ ')) {
          if (line.startsWith('@@ ')) {
            // Parse @@ -old_start,old_count +new_start,new_count @@
            const match = line.match(/\+(\d+)(?:,\d+)?/);
            if (match) {
              currentNewLine = parseInt(match[1], 10) - 1; // convert to 0-index
            }
          }
          continue;
        }

        if (line.startsWith('+')) {
          // Added line in working copy - mark it as added
          const lineIndex = currentNewLine;
          if (lineIndex < lineStatuses.length) {
            lineStatuses[lineIndex] = 'added';
          }
          currentNewLine++;
        } else if (!line.startsWith('-')) {
          // Unchanged line - just advance the counter
          currentNewLine++;
        }
        // Deleted lines are not in the current file, ignore
      }

      // Combine current lines with their status
      return currentLines.map((content, index) => ({
        content,
        type: lineStatuses[index],
      }));
    } catch (e) {
      console.error('Failed to get file diff:', e);
      // Fallback: just return the file with all lines unchanged
      try {
        const fullPath = `${repoPath}/${filePath}`;
        const content = fs.readFileSync(fullPath, 'utf-8');
        let lines = content.split('\n');
        if (content.endsWith('\n')) {
          lines = lines.slice(0, -1);
        }
        return lines.map(line => ({
          content: line,
          type: 'unchanged',
        }));
      } catch {
        return [];
      }
    }
  }

  async getGitUserInfo(repoPath: string): Promise<{ name: string; email: string }> {
    try {
      // First try repository-specific config
      let name = '';
      let email = '';

      try {
        name = execSync('git config --get user.name', { cwd: repoPath, encoding: 'utf-8' }).trim();
        email = execSync('git config --get user.email', { cwd: repoPath, encoding: 'utf-8' }).trim();
      } catch (repoErr) {
        // Fall back to global config if repository config fails
        try {
          name = execSync('git config --global --get user.name', { encoding: 'utf-8' }).trim();
          email = execSync('git config --global --get user.email', { encoding: 'utf-8' }).trim();
        } catch (globalErr) {
          console.error('Failed to get git user info from both repository and global config:', repoErr, globalErr);
          return { name: '', email: '' };
        }
      }

      return { name, email };
    } catch (e) {
      console.error('Failed to get git user info:', e);
      return { name: '', email: '' };
    }
  }
}

export const gitService = new GitService();
