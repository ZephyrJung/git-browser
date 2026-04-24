import React, { useState, useEffect, useRef } from 'react';
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
  repoPath: string;
}

const CommandBar: React.FC<CommandBarProps> = ({ selectedFile, repoPath }) => {
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
  const [showDiffDialog, setShowDiffDialog] = useState(false);
  const [diffSelectedBranch, setDiffSelectedBranch] = useState<string>('');
  const [diffResult, setDiffResult] = useState<{ path: string; changed: boolean }[]>([]);
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [selectedDiffFile, setSelectedDiffFile] = useState<string>('');
  const [leftContent, setLeftContent] = useState('');
  const [rightContent, setRightContent] = useState<string>('');
  const [currentBranchName, setCurrentBranchName] = useState<string>('');
  const [compareBranchName, setCompareBranchName] = useState<string>('');
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [isDiffMaximized, setIsDiffMaximized] = useState(false);
  const [diffContentCache, setDiffContentCache] = useState<Record<string, { left: string; right: string }>>({});
  const [commitMessageDialog, setCommitMessageDialog] = useState<CommitMessageDialog>({
    show: false,
    originalCommand: '',
  });
  const [commitMessage, setCommitMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus command input whenever no dialog is open and not loading
  useEffect(() => {
    if (!loading && !showCommitHistory && !showOutputDialog && !showSwitchBranch && !commitMessageDialog.show && !showDiffDialog && !showDiffViewer) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [loading, showCommitHistory, showOutputDialog, showSwitchBranch, commitMessageDialog.show, showDiffDialog, showDiffViewer]);

  // Global click handler - keep focus on command input when clicking outside dialogs
  useEffect(() => {
    const handleGlobalClick = () => {
      // Don't steal focus if any dialog is open
      if (showCommitHistory || showOutputDialog || showSwitchBranch || commitMessageDialog.show || showDiffDialog || showDiffViewer) {
        return;
      }
      // Don't steal focus if user clicked outside app or on another input/button
      // Just keep focus on command input for better UX
      setTimeout(() => {
        if (document.activeElement !== inputRef.current && !loading) {
          inputRef.current?.focus();
        }
      }, 0);
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [showCommitHistory, showOutputDialog, showSwitchBranch, commitMessageDialog.show, showDiffDialog, showDiffViewer, loading]);

  // Close any open dialog on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCommitHistory) setShowCommitHistory(false);
        if (showOutputDialog) setShowOutputDialog(false);
        if (showSwitchBranch) setShowSwitchBranch(false);
        if (commitMessageDialog.show) setCommitMessageDialog({ show: false, originalCommand: '' });
        if (showDiffViewer) handleCloseDiffViewer();
        if (showDiffDialog) setShowDiffDialog(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommitHistory, showOutputDialog, showSwitchBranch, commitMessageDialog.show, showDiffDialog, showDiffViewer]);

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

  const isCompareCommand = (cmd: string): boolean => {
    const trimmed = cmd.trim().toLowerCase();
    return trimmed === 'compare';
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
      } else if (isCompareCommand(processedCommand)) {
        // compare - open branch diff dialog
        await loadAllBranches();
        setDiffSelectedBranch('');
        setDiffResult([]);
        setShowDiffDialog(true);
        setCommand('');
      } else {
        // All other commands - show raw output in dialog
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

  const toggleDiffBranchSelection = (branchName: string) => {
    if (diffSelectedBranch === branchName) {
      setDiffSelectedBranch('');
    } else {
      setDiffSelectedBranch(branchName);
    }
  };

  // Get file content from a specific branch
  const getFileContentFromBranch = async (repoPath: string, branch: string, filePath: string): Promise<string> => {
    const output = await window.electron.executeGitCommand(repoPath, `git show ${branch}:${filePath}`);
    if (!output.success) {
      return '';
    }
    return output.output;
  };

  const handleCloseDiffDialog = () => {
    setShowDiffDialog(false);
  };

  const handleCloseDiffViewer = () => {
    setShowDiffViewer(false);
    setSelectedDiffFile('');
    setLeftContent('');
    setRightContent('');
    setIsDiffMaximized(false);
    setDiffContentCache({});
  };

  // Memoized diff computation
  const computeLineDiff = (left: string, right: string) => {
    // Simple line-by-line diff
    const leftLines = left.split('\n');
    const rightLines = right.split('\n');
    const maxLen = Math.max(leftLines.length, rightLines.length);
    const result: { leftLines: { content: string; type: string; leftLineNum?: number }[]; rightLines: { content: string; type: string; rightLineNum?: number }[] } = {
      leftLines: [],
      rightLines: []
    };

    for (let i = 0; i < maxLen; i++) {
      const leftLine = leftLines[i] || '';
      const rightLine = rightLines[i] || '';

      if (leftLine === rightLine) {
        result.leftLines.push({ content: leftLine, type: 'unchanged', leftLineNum: i + 1 });
        result.rightLines.push({ content: rightLine, type: 'unchanged', rightLineNum: i + 1 });
      } else if (leftLine === '' && rightLine !== "") {
        result.leftLines.push({ content: '', type: 'removed' });
        result.rightLines.push({ content: rightLine, type: 'added', rightLineNum: i + 1 });
      } else if (leftLine !== "" && rightLine === "") {
        result.leftLines.push({ content: leftLine, type: 'removed', leftLineNum: i + 1 });
        result.rightLines.push({ content: '', type: 'added' });
      } else {
        result.leftLines.push({ content: leftLine, type: 'removed', leftLineNum: i + 1 });
        result.rightLines.push({ content: rightLine, type: 'added', rightLineNum: i + 1 });
      }
    }
    return result;
  };

  const compareBranches = async () => {
    if (!diffSelectedBranch) {
      setStatusMessage('请选择一个分支进行比对');
      return;
    }

    setLoadingDiff(true);
    setStatusMessage(null);
    setDiffContentCache({});

    try {
      const currentBranchOutput = await window.electron.executeGitCommand(repoPath, 'git rev-parse --abbrev-ref HEAD');
      if (!currentBranchOutput.success) {
        setStatusMessage('获取当前分支名称失败');
        setLoadingDiff(false);
        return;
      }
      const currentBranch = currentBranchOutput.output.trim();
      const compareBranch = diffSelectedBranch;

      setCurrentBranchName(currentBranch);
      setCompareBranchName(compareBranch);

      const diffOutput = await window.electron.executeGitCommand(repoPath, `git diff --name-only ${currentBranch} ${compareBranch}`);

      if (!diffOutput.success) {
        setStatusMessage('获取差异文件列表失败');
        setLoadingDiff(false);
        return;
      }

      const diffFiles = diffOutput.output.trim().split('\n').filter((f: string) => f.trim());
      const newDiffResult: { path: string; changed: boolean }[] = diffFiles.map((f: string) => ({
        path: f,
        changed: true,
      }));

      setDiffResult(newDiffResult);

      if (newDiffResult.length === 0) {
        setStatusMessage(`${currentBranch} ↔ ${compareBranch}\n两个分支内容完全一致`);
        setLoadingDiff(false);
        setShowDiffDialog(false);
        return;
      }

      // Preload ALL files content
      setStatusMessage('正在加载文件内容...');
      const preloadPromises = newDiffResult.map(async (item) => {
        const [left, right] = await Promise.all([
          getFileContentFromBranch(repoPath, compareBranch, item.path),
          getFileContentFromBranch(repoPath, currentBranch, item.path),
        ]);
        return { path: item.path, left, right };
      });

      const allContents = await Promise.all(preloadPromises);

      const newCache: Record<string, { left: string; right: string }> = {};
      allContents.forEach(({ path, left, right }) => {
        newCache[path] = { left, right };
      });
      setDiffContentCache(newCache);

      setSelectedDiffFile(newDiffResult[0].path);
      setLeftContent(newCache[newDiffResult[0].path]?.left || '');
      setRightContent(newCache[newDiffResult[0].path]?.right || '');
      setShowDiffDialog(false);
      setShowDiffViewer(true);
      setStatusMessage(null);
      setLoadingDiff(false);
    } catch (e) {
      console.error('Compare branches failed:', e);
      setStatusMessage(`比对失败: ${String(e)}`);
      setLoadingDiff(false);
    }
  };

  // Switch diff file - content should already be preloaded
  const handleDiffFileClick = (filePath: string) => {
    const cached = diffContentCache[filePath];
    if (cached) {
      setSelectedDiffFile(filePath);
      setLeftContent(cached.left);
      setRightContent(cached.right);
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
          ref={inputRef}
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
          发送
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
          <span className="flex items-center px-3 py-2 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 animate-pulse">
            ⏳
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
                {!dialogOutput.trim() ? (
                  <div className="block text-gray-500 italic">
                    命令执行成功，无输出。
                  </div>
                ) : (
                  dialogOutput.split('\n').map((line, index) => {
                    let className = 'block';
                    if (line.startsWith('+')) {
                      className = 'block bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300';
                    } else if (line.startsWith('-')) {
                      className = 'block bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300';
                    } else if (line.startsWith('@')) {
                      className = 'block bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
                    } else if (dialogTitle.toLowerCase().includes('git status') && (
                      line.includes('Changes to be committed') ||
                      line.includes('Changes not staged') ||
                      line.includes('Untracked files') ||
                      line.includes('Unmerged paths'))
                    ) {
                      className = 'block font-bold text-blue-700 dark:text-blue-300 mt-1';
                    } else if (dialogTitle.toLowerCase().includes('git status') && line.trimLeft().startsWith('modified:')) {
                      className = 'block text-blue-700 dark:text-blue-300';
                    } else if (dialogTitle.toLowerCase().includes('git status') && (
                      line.trimLeft().startsWith('new file:') ||
                      line.trimLeft().startsWith('added:'))
                    ) {
                      className = 'block text-green-700 dark:text-green-300';
                    } else if (dialogTitle.toLowerCase().includes('git status') && line.trimLeft().startsWith('deleted:')) {
                      className = 'block text-red-700 dark:text-red-300';
                    } else if (dialogTitle.toLowerCase().includes('git status') && line.trimLeft().startsWith('both modified:')) {
                      className = 'block text-orange-700 dark:text-orange-300';
                    }
                    return (
                      <div key={index} className={className}>
                        <code>{line === '' ? '\u00A0' : line}</code>
                      </div>
                    );
                  })
                )}
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
                placeholder="输入提交信息... (Ctrl/Cmd + Enter 提交)"
                rows={4}
                value={commitMessage}
                onChange={e => setCommitMessage(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleConfirmCommit();
                  }
                }}
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

      {/* Branch Diff Dialog */}
      {showDiffDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-[800px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">分支比对</h2>
              <button
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
                onClick={handleCloseDiffDialog}
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                当前分支 ⟷ 你选择的分支
              </p>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-2">
                {branches.map(branch => {
                  const isSelected = diffSelectedBranch === branch.name;
                  return (
                    <div
                      key={branch.fullName}
                      className={`flex items-center gap-2 p-3 rounded cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                      }`}
                      onClick={() => toggleDiffBranchSelection(branch.name)}
                    >
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => toggleDiffBranchSelection(branch.name)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        name="diffBranchSelection"
                      />
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${
                          branch.isCurrent
                            ? 'font-semibold text-blue-600 dark:text-blue-400'
                            : 'text-gray-800 dark:text-gray-200'
                        }`}>
                          {branch.name}
                        </span>
                        {branch.isCurrent && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 rounded">
                            当前
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {statusMessage && (
              <div className={`mb-4 p-3 rounded text-sm whitespace-pre-line ${
                statusMessage.includes('找到') || statusMessage.includes('完全一致')
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
              }`}>
                {statusMessage}
              </div>
            )}

            {diffResult.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">差异文件 ({diffResult.length}):</h3>
                <div className="space-y-1 max-h-[25vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-2">
                  {diffResult.map(item => (
                    <div
                      key={item.path}
                      className="px-2 py-1 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                    >
                      {item.path}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={handleCloseDiffDialog}
                disabled={loadingDiff}
              >
                关闭
              </button>
              <button
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                onClick={compareBranches}
                disabled={loadingDiff || !diffSelectedBranch}
              >
                {loadingDiff ? '比对中...' : '开始比对'}
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

      {/* Diff Viewer Dialog */}
      {showDiffViewer && (() => {
        const diff = computeLineDiff(leftContent, rightContent);

        const getLineBgClass = (type: string): string => {
          switch (type) {
            case 'added': return 'bg-green-50 dark:bg-green-900/30';
            case 'removed': return 'bg-red-50 dark:bg-red-900/30';
            default: return '';
          }
        };

        const getLineNumBgClass = (type: string): string => {
          switch (type) {
            case 'added': return 'bg-green-100 dark:bg-green-900/50';
            case 'removed': return 'bg-red-100 dark:bg-red-900/50';
            default: return 'bg-gray-50 dark:bg-gray-800';
          }
        };

        const dialogClass = isDiffMaximized
          ? 'bg-white dark:bg-gray-900 w-screen h-screen overflow-hidden'
          : 'bg-white dark:bg-gray-900 rounded-lg p-4 w-[90vw] h-[85vh] overflow-hidden';

        return (
          <div className={`fixed inset-0 ${isDiffMaximized ? '' : 'bg-black/50 flex items-center justify-center'} z-50`}>
            <div className={dialogClass}>
              <div className={`flex justify-between items-center ${isDiffMaximized ? 'px-4 pt-3' : ''} mb-3`}>
                <h2 className="text-lg font-bold truncate">
                  {compareBranchName} ↔ {currentBranchName}
                  {selectedDiffFile && <span className="text-gray-500 dark:text-gray-400 text-sm ml-2 font-normal">• {selectedDiffFile}</span>}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    onClick={() => setIsDiffMaximized(!isDiffMaximized)}
                    title={isDiffMaximized ? '还原' : '最大化'}
                  >
                    {isDiffMaximized ? '🗗' : '🗖'}
                  </button>
                  <button
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    onClick={handleCloseDiffViewer}
                    title="关闭"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex h-[calc(100%-3.5rem)] gap-3">
                {/* Left panel: difference files list */}
                <div className="w-56 flex-shrink-0 border border-gray-200 dark:border-gray-700 rounded overflow-y-auto">
                  <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      差异文件 ({diffResult.length})
                    </h3>
                  </div>
                  <div className="space-y-0.5 px-1 py-1">
                    {diffResult.map(item => {
                      const isSelected = selectedDiffFile === item.path;
                      return (
                        <div
                          key={item.path}
                          className={`px-2 py-1 rounded cursor-pointer text-xs ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
                          }`}
                          onClick={() => handleDiffFileClick(item.path)}
                        >
                          {item.path}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right panel: two column content comparison */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex flex-1 gap-0 overflow-hidden">
                    {/* Left column: compare branch content */}
                    <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-l overflow-y-auto">
                      <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 z-10">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {compareBranchName}
                        </span>
                      </div>
                      <pre className="text-xs font-mono leading-5">
                        <code className="prism-code">
                          {diff.leftLines.map((line, index) => (
                            <div key={index} className={`flex ${getLineBgClass(line.type)}`}>
                              <span className={`inline-block w-10 text-right pr-2 select-none flex-shrink-0 text-gray-400 text-xs ${getLineNumBgClass(line.type)}`}>
                                {line.leftLineNum ?? ''}
                              </span>
                              <span className="flex-1 pl-2 whitespace-pre">
                                {line.content || '\u00A0'}
                              </span>
                            </div>
                          ))}
                        </code>
                      </pre>
                    </div>

                    {/* Divider */}
                    <div className="w-px bg-gray-300 dark:bg-gray-600 flex-shrink-0" />

                    {/* Right column: current branch content */}
                    <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-r overflow-y-auto">
                      <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 z-10">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {currentBranchName}
                        </span>
                      </div>
                      <pre className="text-xs font-mono leading-5">
                        <code className="prism-code">
                          {diff.rightLines.map((line, index) => (
                            <div key={index} className={`flex ${getLineBgClass(line.type)}`}>
                              <span className={`inline-block w-10 text-right pr-2 select-none flex-shrink-0 text-gray-400 text-xs ${getLineNumBgClass(line.type)}`}>
                                {line.rightLineNum ?? ''}
                              </span>
                              <span className="flex-1 pl-2 whitespace-pre">
                                {line.content || '\u00A0'}
                              </span>
                            </div>
                          ))}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default CommandBar;
