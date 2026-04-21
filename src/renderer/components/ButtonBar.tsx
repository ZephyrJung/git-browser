import React, { useState, useEffect } from 'react';

import type { CommandResult } from '@/shared/types';

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

interface ButtonBarProps {
  repoPath: string;
}

const ButtonBar: React.FC<ButtonBarProps> = ({ repoPath }) => {
  const [showCommitHistory, setShowCommitHistory] = useState(false);
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [showBranchList, setShowBranchList] = useState(false);
  const [showBranchManagement, setShowBranchManagement] = useState(false);
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Close any open dialog on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCommitHistory) setShowCommitHistory(false);
        if (showBranchList) setShowBranchList(false);
        if (showBranchManagement) setShowBranchManagement(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommitHistory, showBranchList, showBranchManagement]);

  const buttons = [
    { id: 'log', label: '提交历史' },
    { id: 'branch', label: '分支管理' },
    { id: 'pull', label: '拉取最新' },
    { id: 'push', label: '推送远程' },
    { id: 'diff', label: '分支比对' },
    { id: 'merge', label: '分支合并' },
  ];

  const loadCommitHistory = async () => {
    setLoading(true);
    try {
      console.log('Loading commit history from:', repoPath);
      // Quote the format string because | is interpreted as pipe by shell
      // Use %ci instead of %ai to get date without timezone offset
      // Use double quotes for Windows compatibility (cmd doesn't like single quotes)
      const logOutput: CommandResult = await window.electron.executeGitCommand(repoPath, 'git log --pretty=format:"%h|%an|%ci|%s" -n 100');
      console.log('git log output:', logOutput);
      if (logOutput.output && logOutput.output.trim()) {
        const lines = logOutput.output.trim().split('\n').filter((line: string) => line.trim());
        console.log('Parsed lines:', lines.length);
        const parsedCommits = lines.map((line: string) => {
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
        console.log('Parsed commits:', parsedCommits);
        setCommits(parsedCommits);
      } else {
        console.log('No output from git log');
        setCommits([]);
      }
    } catch (e) {
      console.error('Failed to load commit history:', e);
      setCommits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (id: string) => {
    console.log('Button clicked:', id);
    if (id === 'log') {
      await loadCommitHistory();
      setShowCommitHistory(true);
    } else if (id === 'branch') {
      await loadBranches();
      setSelectedBranches(new Set());
      setShowBranchManagement(true);
    }
    // TODO: 其他按钮弹出对应操作对话框
  };

  const handleClose = () => {
    setShowCommitHistory(false);
  };

  const [copyToast, setCopyToast] = useState<string | null>(null);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopyToast(`已复制: ${hash}`);
    setTimeout(() => setCopyToast(null), 2000);
  };

  const loadBranches = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
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

  const handleCloseBranchList = () => {
    setShowBranchList(false);
  };

  const handleCloseBranchManagement = () => {
    setShowBranchManagement(false);
    setSelectedBranches(new Set());
  };

  const handleCopyBranch = (branchName: string) => {
    navigator.clipboard.writeText(branchName);
    setCopyToast(`已复制: ${branchName}`);
    setTimeout(() => setCopyToast(null), 2000);
  };

  const switchBranch = async (branch: BranchInfo) => {
    if (branch.isCurrent) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      const output: CommandResult = await window.electron.executeGitCommand(repoPath, `git checkout ${branch.fullName}`);
      if (output.success) {
        setStatusMessage(`已切换到分支: ${branch.name}`);
        // Refresh git status after switch
        setTimeout(() => {
          setShowBranchManagement(false);
          window.location.reload();
        }, 1000);
      } else {
        setStatusMessage(`切换失败: ${output.output}`);
      }
    } catch (e) {
      console.error('Failed to switch branch:', e);
      setStatusMessage(`切换失败: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleBranchSelection = (branchName: string) => {
    const newSelected = new Set(selectedBranches);
    if (newSelected.has(branchName)) {
      newSelected.delete(branchName);
    } else {
      newSelected.add(branchName);
    }
    setSelectedBranches(newSelected);
  };

  const deleteSelectedBranches = async () => {
    if (selectedBranches.size === 0) {
      setStatusMessage('请先选择要删除的分支');
      return;
    }

    // 不允许删除当前分支
    const currentBranch = branches.find(b => b.isCurrent);
    if (currentBranch && selectedBranches.has(currentBranch.name)) {
      setStatusMessage('不能删除当前分支');
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      let successCount = 0;
      let errorMessages: string[] = [];

      for (const branchName of selectedBranches) {
        // Find the branch info
        const branch = branches.find(b => b.name === branchName);
        if (!branch) continue;

        // Cannot delete remote branches
        if (branch.isRemote) {
          errorMessages.push(`${branchName}: 不支持删除远程分支`);
          continue;
        }

        // Delete local branch
        const output: CommandResult = await window.electron.executeGitCommand(repoPath, `git branch -d ${branch.name}`);
        if (output.success) {
          successCount++;
        } else {
          errorMessages.push(`${branchName}: ${output.output || output.error || '删除失败'}`);
        }
      }

      // Reload branches after deletion
      await loadBranches();
      setSelectedBranches(new Set());

      if (errorMessages.length === 0) {
        setStatusMessage(`成功删除 ${successCount} 个分支`);
        // Reload page after short delay to refresh everything
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setStatusMessage(`删除完成: 成功 ${successCount} 个, 失败 ${errorMessages.length} 个\n${errorMessages.join('\n')}`);
      }
    } catch (e) {
      console.error('Failed to delete branches:', e);
      setStatusMessage(`删除失败: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
      <div className="flex gap-2">
        {buttons.map(btn => (
          <button
            key={btn.id}
            className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onClick={() => handleClick(btn.id)}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {showCommitHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-[800px] max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">提交历史</h2>
              <button
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
                onClick={handleClose}
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">加载中...</div>
            ) : commits.length === 0 ? (
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
                onClick={handleClose}
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

      {/* Branch Management Dialog */}
      {showBranchManagement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-[600px] max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">分支管理</h2>
              <button
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
                onClick={handleCloseBranchManagement}
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
                    className={`p-3 border rounded ${
                      branch.isCurrent
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500'
                        : selectedBranches.has(branch.name)
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-500'
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {!branch.isCurrent && !branch.isRemote && (
                          <input
                            type="checkbox"
                            checked={selectedBranches.has(branch.name)}
                            onChange={() => toggleBranchSelection(branch.name)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        )}
                        {branch.isRemote && (
                          <div className="w-4" />
                        )}
                        {branch.isCurrent && (
                          <div className="w-4" />
                        )}
                        <div
                          className={`flex items-center gap-2 ${!branch.isCurrent && !branch.isRemote ? 'cursor-pointer' : ''}`}
                          onClick={() => {
                            if (!branch.isCurrent) {
                              switchBranch(branch);
                            }
                          }}
                        >
                          <span className={`text-sm ${branch.isCurrent ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200 cursor-pointer'}`}>
                            {branch.name}
                          </span>
                          {branch.isRemote && (
                            <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded">
                              远程
                            </span>
                          )}
                          {branch.isCurrent && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 rounded">
                              当前
                            </span>
                          )}
                        </div>
                      </div>
                      {!branch.isCurrent && !branch.isRemote && (
                        <button
                          className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/30"
                          onClick={() => switchBranch(branch)}
                        >
                          切换
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {statusMessage && !loading && (
              <div className={`mt-4 p-3 rounded text-sm whitespace-pre-line ${
                statusMessage.includes('成功')
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
              }`}>
                {statusMessage}
              </div>
            )}

            <div className="flex justify-between mt-6">
              {selectedBranches.size > 0 && (
                <button
                  className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-1 focus:ring-red-500"
                  onClick={deleteSelectedBranches}
                  disabled={loading}
                >
                  删除选中 ({selectedBranches.size})
                </button>
              )}
              {selectedBranches.size === 0 && (
                <div />
              )}
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={handleCloseBranchManagement}
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

      {/* Branch List Dialog (readonly, copy to clipboard) */}
      {showBranchList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-[500px] max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">分支列表</h2>
              <button
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
                onClick={handleCloseBranchList}
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
    </div>
  );
};

export default ButtonBar;
