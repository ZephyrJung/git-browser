// Git 操作服务

import git from 'isomorphic-git';
import fs from 'fs';
import type { GitStatus } from '@/shared/types';

export class GitService {
  async getStatus(repoPath: string): Promise<GitStatus> {
    try {
      // @ts-ignore isomorphic-git type mismatch issue
      const branch = await git.currentBranch({ fs, dir: repoPath, gitdir: repoPath + '/.git' });
      // @ts-ignore isomorphic-git type mismatch issue
      const status = await git.status({ fs, dir: repoPath });

      const files: GitStatus['files'] = {};

      for (const file of status) {
        if (file.includes(' ')) {
          // 处理合并状态
          files[file.split(' ')[1]] = 'conflict';
        } else {
          // isomorphic-git 返回: M = modified, A = added, D = deleted
          const filePath = file;
          if (file.startsWith('A ')) {
            files[filePath.substring(2)] = 'new';
          } else if (file.startsWith('M ')) {
            files[filePath.substring(2)] = 'modified';
          } else if (file.startsWith(' D ')) {
            files[filePath.substring(2)] = 'deleted';
          } else {
            files[filePath] = 'modified';
          }
        }
      }

      return {
        branch: branch || '',
        hasUncommittedChanges: status.length > 0,
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
}

export const gitService = new GitService();
