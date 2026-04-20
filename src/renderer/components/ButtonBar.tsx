import React, { useState } from 'react';

import type { CommandResult } from '@/shared/types';

interface CommitInfo {
  hash: string;
  author: string;
  date: string;
  message: string;
}

interface ButtonBarProps {
  // TODO: 实现各个按钮的点击处理
}

const ButtonBar: React.FC<ButtonBarProps> = () => {
  const [showCommitHistory, setShowCommitHistory] = useState(false);
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const buttons = [
    { id: 'log', label: '提交历史' },
    { id: 'switch', label: '切换分支' },
    { id: 'pull', label: '拉取最新' },
    { id: 'push', label: '推送远程' },
    { id: 'diff', label: '分支比对' },
    { id: 'merge', label: '分支合并' },
  ];

  const loadCommitHistory = async () => {
    setLoading(true);
    try {
      const repoPath = await window.electron.getCurrentRepoPath();
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
    </div>
  );
};

export default ButtonBar;
