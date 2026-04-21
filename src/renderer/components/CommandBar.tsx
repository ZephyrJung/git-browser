import React, { useState, useEffect } from 'react';
import type { CommandResult } from '@/shared/types';

import type { FileNode } from '@/shared/types';

interface CommitInfo {
  hash: string;
  author: string;
  date: string;
  message: string;
}

interface BranchInfo {
  name: string;        // display name (remote: stripped origin/ prefix)
  fullName: string;    // full name (origin/main) for checkout
  isCurrent: boolean;
  isRemote: boolean;
}

interface CommitMessageDialog {
  show: boolean;
  originalCommand: string;
}

interface CommandBarProps {
  selectedFile: FileNode | null;
}

const CommandBar: React.FC<CommandBarProps> = ({ selectedFile }) => {
  const [command, setCommand] = useState('');
  const [result, setResult] = useState<CommandResult | null>(null);
  const [showOutputDialog, setShowOutputDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogOutput, setDialogOutput] = useState('');
  const [showCommitHistory, setShowCommitHistory] = useState(false);
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [showSwitchBranch, setShowSwitchBranch] = useState(false);
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [commitMessageDialog, setCommitMessageDialog] = useState<CommitMessageDialog>({
    show: false,
    originalCommand: '',
  });
  const [commitMessage, setCommitMessage] = useState('');

  // Close any open dialog on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCommitHistory) setShowCommitHistory(false);
        if (showOutputDialog) setShowOutputDialog(false);
        if (showSwitchBranch) setShowSwitchBranch(false);
        if (commitMessageDialog.show) setCommitMessageDialog({ show: false, originalCommand: '' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommitHistory, showOutputDialog, showSwitchBranch, commitMessageDialog.show]);

  const isGitLogCommand = (cmd: string): boolean => {
    const trimmed = cmd.trim().toLowerCase();
    return trimmed === 'git log' || trimmed.startsWith('git log ');
  };

  const isBranchCommand = (cmd: string): boolean => {
    const trimmed = cmd.trim().toLowerCase();
    // Only open selection dialog when user enters git branch without any arguments
    // If user adds args (git branch -a, git branch -v), just output normally
    return trimmed === 'git branch';
  };

  const isGitCommitWithoutMessage = (cmd: string): boolean => {
    const trimmed = cmd.trim().toLowerCase();
    // Check if this is a git commit command without -m/--message parameter
    if (!trimmed.startsWith('git commit')) {
      return false;
    }
    // If it's just "git commit" with no arguments
    if (trimmed === 'git commit') {
      return true;
    }
    // If it has arguments but no -m or --message
    return !trimmed.includes(' -m') && !trimmed.includes(' --message');
  };

  const shouldShowDialog = (cmd: string): boolean => {
    const trimmed = cmd.trim().toLowerCase();
    // Already handled by specialized UI: git log, git branch (no args)
    // All other commands should show output in dialog
    return !isGitLogCommand(trimmed) && !isBranchCommand(trimmed);
  };

  const processCommand = (cmd: string): string => {
    let processed = cmd.trim();
    const lower = processed.toLowerCase();

    // If git diff with no arguments and we have a selected file, add the file path
    if ((lower === 'git diff' || lower === 'diff') && selectedFile) {
      if (lower === 'diff') {
        processed = `git diff ${selectedFile.path}`;
      } else {
        processed = `git diff ${selectedFile.path}`;
      }
    }

    return processed;
  };

  const loadAllBranches = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const repoPath = await window.electron.getCurrentRepoPath();
      // Get all branches including both local and remote
      // Format: %(refname:short)|%(HEAD)|%(refname:lstrip=2)
      // For local: main| |main
      // For remote: origin/main| |remotes/origin
      const output: CommandResult = await window.electron.executeGitCommand(repoPath, 'git branch -a --format="%(refname:short)|%(HEAD)|%(refname:lstrip=2)"');
      if (output.output && output.output.trim()) {
        const lines = output.output.trim().split('\n').filter((line: string) => line.trim());
        const parsedBranches = lines.map((line: string) => {
          const [name, isHead, ref] = line.split('|');
          let displayName = name.trim();
          const isRemote = ref.startsWith('remotes/');
          // For remote branches: strip the remote prefix from display name (origin/main -> main)
          if (isRemote) {
            const firstSlash = displayName.indexOf('/');
            if (firstSlash !== -1) {
              displayName = displayName.slice(firstSlash + 1);
            }
          }
          return {
            name: displayName,
            fullName: name.trim(),
            isCurrent: isHead.trim() === '*',
            isRemote,
          };
        });
        // Filter out empty lines
        const filteredBranches = parsedBranches.filter(b => b.name);
        // Deduplicate: if same display name exists in both local and remote, keep only local
        const seenNames = new Set<string>();
        // Add local branches first
        const result: BranchInfo[] = [];
        filteredBranches.filter(b => !b.isRemote).forEach(b => {
          if (!seenNames.has(b.name)) {
            seenNames.add(b.name);
            result.push(b);
          }
        });
        // Then add remote branches that don't have local duplicate
        filteredBranches.filter(b => b.isRemote).forEach(b => {
          if (!seenNames.has(b.name)) {
            seenNames.add(b.name);
            result.push(b);
          }
        });
        // Sort: current first, then local, then remote
        result.sort((a, b) => {
          if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
          if (a.isRemote !== b.isRemote) return a.isRemote ? 1 : -1;
          return a.name.localeCompare(b.name);
        });
        setBranches(result);
      } else {
        setBranches([]);
        setStatusMessage('获取分支列表失败');
      }
    } catch (e) {
      console.error('Failed to load branches:', e);
      setBranches([]);
      setStatusMessage(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSwitchBranch = () => {
    setShowSwitchBranch(false);
  };

  const handleCopyBranch = (branchName: string) => {
    navigator.clipboard.writeText(branchName);
    setCopyToast(`已复制: ${branchName}`);
    setTimeout(() => setCopyToast(null), 2000);
  };

  const parseCommitsFromOutput = (output: string): CommitInfo[] => {
    const lines = output.trim().split('\n').filter(line => line.trim());
    return lines.map((line: string) => {
      // Find the first three |, the rest is message (in case message contains |)
      const firstSep = line.indexOf('|');
      const secondSep = line.indexOf('|', firstSep + 1);
      const thirdSep = line.indexOf('|', secondSep + 1);
      if (firstSep !== -1 && secondSep !== -1 && thirdSep !== -1) {
        const hash = line.slice(0, firstSep);
        const author = line.slice(firstSep + 1, secondSep);
        let date = line.slice(secondSep + 1, thirdSep);
        // Remove timezone offset at the end (everything after last space)
        const lastSpace = date.lastIndexOf(' ');
        if (lastSpace !== -1) {
          date = date.slice(0, lastSpace);
        }
        const message = line.slice(thirdSep + 1);
        return { hash, author, date, message };
      }
      // Fallback
      const parts = line.split('|');
      let date = parts[2] || '';
      const lastSpace = date.lastIndexOf(' ');
      if (lastSpace !== -1) {
        date = date.slice(0, lastSpace);
      }
      return {
        hash: parts[0] || '',
        author: parts[1] || '',
        date,
        message: parts.slice(3).join('|') || '',
      };
    });
  };

  const loadCommitHistory = async () => {
    setLoading(true);
    try {
      const repoPath = await window.electron.getCurrentRepoPath();
      // Use the same format as button bar
      // Use double quotes for Windows compatibility (cmd doesn't like single quotes)
      const logOutput: CommandResult = await window.electron.executeGitCommand(repoPath, 'git log --pretty=format:"%h|%an|%ci|%s" -n 100');
      if (logOutput.output && logOutput.output.trim()) {
        const parsedCommits = parseCommitsFromOutput(logOutput.output);
        setCommits(parsedCommits);
        setShowCommitHistory(true);
      } else {
        setResult({
          success: false,
          output: 'No commit history found',
        });
      }
    } catch (e) {
      console.error('Failed to load commit history:', e);
      setResult({
        success: false,
        output: String(e),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopyToast(`已复制: ${hash}`);
    setTimeout(() => setCopyToast(null), 2000);
  };

  const executeCommand = async () => {
    if (!command.trim() || loading) return;
    const processedCommand = processCommand(command);
    const lower = processedCommand.toLowerCase();

    setLoading(true);
    try {
      if (isGitLogCommand(processedCommand)) {
        // Special handling for git log - open formatted commit dialog
        await loadCommitHistory();
        setCommand('');
      } else if (isBranchCommand(lower)) {
        // git branch - show selection dialog with all branches
        await loadAllBranches();
        setShowSwitchBranch(true);
        setCommand('');
      } else if (isGitCommitWithoutMessage(processedCommand)) {
        // git commit without -m parameter - prompt for commit message
        setCommitMessageDialog({
          show: true,
          originalCommand: processedCommand,
        });
        setCommitMessage('');
        setCommand('');
      } else {
        // All other commands - show raw output in dialog
        const repoPath = await window.electron.getCurrentRepoPath();
        const executionResult: CommandResult = await window.electron.executeGitCommand(repoPath, processedCommand);
        setDialogTitle(processedCommand);
        setDialogOutput(executionResult.output || executionResult.error || '');
        setShowOutputDialog(true);
        setResult(executionResult);
        setCommand('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCommit = async () => {
    if (!commitMessage.trim() || loading) {
      return;
    }
    setLoading(true);
    try {
      const repoPath = await window.electron.getCurrentRepoPath();
      // Build the final command: git commit -m "message"
      // Add any extra arguments from original command
      let finalCommand = commitMessageDialog.originalCommand;
      if (finalCommand === 'git commit') {
        finalCommand = `git commit -m "${commitMessage.replace(/"/g, '\\"')}"`;
      } else {
        // Insert -m before other flags
        finalCommand = `${commitMessageDialog.originalCommand} -m "${commitMessage.replace(/"/g, '\\"')}"`;
      }
      const executionResult: CommandResult = await window.electron.executeGitCommand(repoPath, finalCommand);
      setDialogTitle(finalCommand);
      setDialogOutput(executionResult.output || executionResult.error || '');
      setShowOutputDialog(true);
      setResult(executionResult);
      setCommitMessageDialog({ show: false, originalCommand: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCommit = () => {
    setCommitMessageDialog({ show: false, originalCommand: '' });
    setCommitMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand();
    }
  };

  const handleCloseCommitHistory = () => {
    setShowCommitHistory(false);
  };

  const handleCloseOutputDialog = () => {
    setShowOutputDialog(false);
  };

  return (
    <div className="border-t border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 px-3 py-2 text-sm border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800"
          placeholder="输入 Git 命令，按回车执行..."
          value={command}
          onChange={e => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={executeCommand}
          disabled={loading}
        >
          {loading ? '执行中...' : '发送'}
        </button>
        {result && !loading && (
          <span
            className={`flex items-center px-3 py-2 rounded ${
              result.success
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {result.success ? '✓' : '✗'}
          </span>
        )}
        {loading && (
          <span className="flex items-center px-3 py-2 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            执行中...
          </span>
        )}
      </div>

      {/* Special dialog for formatted commit history */}
      {showCommitHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-[800px] max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">提交历史</h2>
              <button
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
                onClick={handleCloseCommitHistory}
              >
                ✕
              </button>
            </div>

            {commits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无提交历史</div>
            ) : (
              <div className="space-y-3">
                {commits.map((commit) => (
                  <div
                    key={commit.hash}
                    className="p-3 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code
                            className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                            onClick={() => handleCopyHash(commit.hash)}
                            title="点击复制哈希"
                          >
                            {commit.hash}
                          </code>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {commit.author}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {commit.date}
                          </span>
                        </div>
                        <div className="text-sm text-gray-800 dark:text-gray-200">
                          {commit.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={handleCloseCommitHistory}
              >
                关闭
              </button>
            </div>

            {copyToast && (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded text-sm z-50">
                {copyToast}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generic dialog for raw command output */}
      {showOutputDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-[750px] max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{dialogTitle}</h2>
              <button
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
                onClick={handleCloseOutputDialog}
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-auto max-h-[50vh] text-xs">
              <pre>
                {dialogOutput.split('\n').map((line, index) => {
                  let className = 'block';
                  if (line.startsWith('+')) {
                    className = 'block bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300';
                  } else if (line.startsWith('-')) {
                    className = 'block bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300';
                  } else if (line.startsWith('@')) {
                    className = 'block bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
                  } else if (dialogTitle === 'git status' && (
                    line.includes('Changes to be committed') ||
                    line.includes('Changes not staged') ||
                    line.includes('Untracked files') ||
                    line.includes('Unmerged paths'))
                  ) {
                    className = 'block font-bold text-blue-700 dark:text-blue-300 mt-1';
                  } else if (dialogTitle === 'git status' && line.trimLeft().startsWith('modified:')) {
                    className = 'block text-blue-700 dark:text-blue-300';
                  } else if (dialogTitle === 'git status' && (
                    line.trimLeft().startsWith('new file:') ||
                    line.trimLeft().startsWith('added:'))
                  ) {
                    className = 'block text-green-700 dark:text-green-300';
                  } else if (dialogTitle === 'git status' && line.trimLeft().startsWith('deleted:')) {
                    className = 'block text-red-700 dark:text-red-300';
                  } else if (dialogTitle === 'git status' && line.trimLeft().startsWith('both modified:')) {
                    className = 'block text-orange-700 dark:text-orange-300';
                  }
                  return (
                    <div key={index} className={className}>
                      <code>{line === '' ? '\u00A0' : line}</code>
                    </div>
                  );
                })}
              </pre>
            </div>

            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={handleCloseOutputDialog}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Switch Branch Dialog */}
      {showSwitchBranch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-[500px] max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">分支列表</h2>
              <button
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
                onClick={handleCloseSwitchBranch}
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">加载中...</div>
            ) : branches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {statusMessage || '暂无分支'}
              </div>
            ) : (
              <div className="space-y-2">
                {branches.map((branch) => (
                  <div
                    key={branch.fullName}
                    className={`p-3 border rounded cursor-pointer ${
                      branch.isCurrent
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500'
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => handleCopyBranch(branch.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${branch.isCurrent ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                          {branch.name}
                        </span>
                        {branch.isRemote && (
                          <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded">
                            远程
                          </span>
                        )}
                      </div>
                      {branch.isCurrent && (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 rounded">
                          当前
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {statusMessage && !loading && (
              <div className={`mt-4 p-3 rounded text-sm ${
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
              }`}>
                {statusMessage}
              </div>
            )}

            {copyToast && (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded text-sm z-50">
                {copyToast}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Commit Message Input Dialog */}
      {commitMessageDialog.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">输入提交信息</h2>
              <button
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
                onClick={handleCancelCommit}
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <textarea
                className="w-full px-3 py-2 text-sm border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="输入提交信息..."
                rows={4}
                value={commitMessage}
                onChange={e => setCommitMessage(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={handleCancelCommit}
              >
                取消
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={handleConfirmCommit}
                disabled={!commitMessage.trim()}
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandBar;
