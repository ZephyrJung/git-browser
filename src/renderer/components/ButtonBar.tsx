import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as Diff from 'diff';
import { highlight } from '../utils/syntaxHighlight';

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
  const [showCommitPushDialog, setShowCommitPushDialog] = useState(false);
  const [changedFiles, setChangedFiles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [commitMessage, setCommitMessage] = useState('');
  const [gitUser, setGitUser] = useState({ name: '', email: '' });
  const [gitStatusCache, setGitStatusCache] = useState<{ files: { [path: string]: { status: string; staged: boolean } } }>({ files: {} });
  const [showPullResult, setShowPullResult] = useState(false);
  const [pullResultMessage, setPullResultMessage] = useState('');
  const [pullIsSuccess, setPullIsSuccess] = useState(false);
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
  // Cache for preloaded diff content: filePath -> { left, right }
  const [diffContentCache, setDiffContentCache] = useState<Record<string, { left: string; right: string }>>({});

  // Merge related states
  const [showMergeSelectDialog, setShowMergeSelectDialog] = useState(false);
  const [showMergeResult, setShowMergeResult] = useState(false);
  const [showConflictResolver, setShowConflictResolver] = useState(false);
  const [mergeSelectedBranch, setMergeSelectedBranch] = useState<string>('');
  const [mergeResultFiles, setMergeResultFiles] = useState<string[]>([]);
  const [selectedMergeResultFile, setSelectedMergeResultFile] = useState<string>('');
  const [mergeDiffContent, setMergeDiffContent] = useState<string>('');
  const [conflictFiles, setConflictFiles] = useState<string[]>([]);
  const [selectedConflictFile, setSelectedConflictFile] = useState<string>('');
  const [conflictLeftContent, setConflictLeftContent] = useState<string>('');
  const [conflictRightContent, setConflictRightContent] = useState<string>('');
  const [isMergeMaximized, setIsMergeMaximized] = useState(false);

  // Close any open dialog on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCommitHistory) setShowCommitHistory(false);
        if (showBranchList) setShowBranchList(false);
        if (showBranchManagement) setShowBranchManagement(false);
        if (showCommitPushDialog) setShowCommitPushDialog(false);
        if (showPullResult) setShowPullResult(false);
        if (showDiffDialog) setShowDiffDialog(false);
        if (showDiffViewer) handleCloseDiffViewer();
        if (showMergeSelectDialog) setShowMergeSelectDialog(false);
        if (showMergeResult) setShowMergeResult(false);
        if (showConflictResolver) setShowConflictResolver(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommitHistory, showBranchList, showBranchManagement, showCommitPushDialog, showPullResult, showDiffDialog, showDiffViewer, showMergeSelectDialog, showMergeResult, showConflictResolver]);

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
    } else if (id === 'push') {
      await openCommitPushDialog();
    } else if (id === 'pull') {
      await handlePull();
    } else if (id === 'diff') {
      await openDiffDialog();
    } else if (id === 'merge') {
      await openMergeSelectDialog();
    }
    // TODO: 其他按钮弹出对应操作对话框
  };

  const handlePull = async () => {
    setLoading(true);
    setPullIsSuccess(false);
    try {
      const output = await window.electron.executeGitCommand(repoPath, 'git pull');

      if (output.success) {
        // Check if already up to date (english and chinese messages)
        if (output.output.includes('Already up to date') || output.output.includes('已是最新')) {
          setPullResultMessage('本地已是最新代码');
        } else {
          // Get first non-empty line for simple message
          const firstLine = output.output.split('\n').find((line: string) => line.trim());
          setPullResultMessage(firstLine ? `拉取成功: ${firstLine}` : '拉取成功');
        }
        setPullIsSuccess(true);
        // Refresh page after successful pull to update git status
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        // Simplify error message - extract first meaningful line
        const lines = output.output.trim().split('\n').filter((line: string) => line.trim() && !line.startsWith(' '));
        const simplifiedError = lines.length > 0 ? lines[0] : '拉取失败，请检查网络或权限';
        setPullResultMessage(simplifiedError);
        setPullIsSuccess(false);
      }
      setShowPullResult(true);
    } catch (e) {
      console.error('Pull failed:', e);
      setPullResultMessage('拉取失败，请重试');
      setPullIsSuccess(false);
      setShowPullResult(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClosePullResult = () => {
    setShowPullResult(false);
  };

  const openMergeSelectDialog = async () => {
    const currentBranchOutput = await window.electron.executeGitCommand(repoPath, 'git rev-parse --abbrev-ref HEAD');
    if (!currentBranchOutput.success) {
      setStatusMessage('获取当前分支失败');
      return;
    }
    const currentBranch = currentBranchOutput.output.trim();

    await loadBranches();

    setMergeSelectedBranch(currentBranch);
    setShowMergeSelectDialog(true);
  };

  const handleMergeSelectBranch = (branchName: string) => {
    if (mergeSelectedBranch === branchName) {
      setMergeSelectedBranch('');
    } else {
      setMergeSelectedBranch(branchName);
    }
  };

  const executeMerge = async () => {
    if (!mergeSelectedBranch) return;

    setLoading(true);
    setStatusMessage(null);
    setShowMergeSelectDialog(false);

    try {
      const currentBranchOutput = await window.electron.executeGitCommand(repoPath, 'git rev-parse --abbrev-ref HEAD');
      if (!currentBranchOutput.success) {
        setStatusMessage('获取当前分支失败');
        setLoading(false);
        return;
      }
      const currentBranch = currentBranchOutput.output.trim();

      const mergeCommand = `git checkout "${mergeSelectedBranch}" && git merge "${currentBranch}"`;
      await window.electron.executeGitCommand(repoPath, mergeCommand);

      const statusOutput = await window.electron.executeGitCommand(repoPath, 'git status --porcelain');
      const conflictLines = statusOutput.output
        .split('\n')
        .filter((line: string) => line.trim());

      const actualConflicts = conflictLines.filter((line: string) => {
        const parts = line.trim().split(' ');
        const status = parts[0];
        return status.includes('U') || status === 'DD' || status === 'AU' || status === 'DU' || status === 'UA' || status === 'UD';
      });

      if (actualConflicts.length > 0) {
        const conflictFilePaths = actualConflicts.map((line: string) => {
          const parts = line.trim().split(/\s+/);
          return parts[1] || parts[0];
        }).filter(Boolean);

        setConflictFiles(conflictFilePaths);
        setSelectedConflictFile(conflictFilePaths[0] || '');
        setShowConflictResolver(true);
        setLoading(false);
        return;
      }

      const mergeResultOutput = await window.electron.executeGitCommand(repoPath, 'git diff --name-only HEAD~1 HEAD');
      const files = mergeResultOutput.output.trim().split('\n').filter((f: string) => f.trim());

      setMergeResultFiles(files);
      setSelectedMergeResultFile(files[0] || '');
      setShowMergeResult(true);
      setLoading(false);

      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (e) {
      console.error('Merge failed:', e);
      setStatusMessage(`合并失败: ${String(e)}`);
      setLoading(false);
    }
  };

  const loadConflictFile = async (filePath: string) => {
    setSelectedConflictFile(filePath);

    try {
      const [oursOutput, theirsOutput] = await Promise.all([
        window.electron.executeGitCommand(repoPath, `git show :1:${filePath}`),
        window.electron.executeGitCommand(repoPath, `git show :3:${filePath}`),
      ]);

      setConflictLeftContent(oursOutput.output || '(空)');
      setConflictRightContent(theirsOutput.output || '(空)');
    } catch (e) {
      const fileOutput = await window.electron.executeGitCommand(repoPath, `cat "${filePath}"`);
      const content = fileOutput.output || '';

      const lines = content.split('\n');
      const leftLines: string[] = [];
      const rightLines: string[] = [];
      let section = 'left';

      for (const line of lines) {
        if (line.startsWith('<<<<<<<')) {
          section = 'left';
        } else if (line.startsWith('=======')) {
          section = 'right';
        } else if (line.startsWith('>>>>>>>')) {
          section = 'done';
        } else {
          if (section === 'left') leftLines.push(line);
          else if (section === 'right') rightLines.push(line);
        }
      }

      setConflictLeftContent(leftLines.join('\n'));
      setConflictRightContent(rightLines.join('\n'));
    }
  };

  const resolveConflict = async (version: 'ours' | 'theirs') => {
    if (!selectedConflictFile) return;

    try {
      const checkoutCmd = version === 'ours'
        ? `git checkout --ours "${selectedConflictFile}"`
        : `git checkout --theirs "${selectedConflictFile}"`;

      await window.electron.executeGitCommand(repoPath, checkoutCmd);
      await window.electron.executeGitCommand(repoPath, `git add "${selectedConflictFile}"`);

      const remainingConflicts = conflictFiles.filter(f => f !== selectedConflictFile);
      setConflictFiles(remainingConflicts);

      if (remainingConflicts.length > 0) {
        setSelectedConflictFile(remainingConflicts[0]);
        await loadConflictFile(remainingConflicts[0]);
      } else {
        setShowConflictResolver(false);
        setStatusMessage('所有冲突已解决！');
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (e) {
      console.error('Failed to resolve conflict:', e);
      setStatusMessage(`解决冲突失败: ${String(e)}`);
    }
  };

  const resolveAllConflicts = async () => {
    for (const file of conflictFiles) {
      try {
        await window.electron.executeGitCommand(repoPath, `git checkout --ours "${file}"`);
        await window.electron.executeGitCommand(repoPath, `git add "${file}"`);
      } catch (e) {
        console.error(`Failed to resolve ${file}:`, e);
      }
    }

    setConflictFiles([]);
    setShowConflictResolver(false);
    setStatusMessage('所有冲突已保留目标版本！');
    setTimeout(() => window.location.reload(), 1000);
  };

  const openExternalEditor = async () => {
    if (process.platform === 'darwin') {
      await window.electron.executeGitCommand(repoPath, `open "${selectedConflictFile}"`);
    } else if (process.platform === 'win32') {
      await window.electron.executeGitCommand(repoPath, `start "" "${selectedConflictFile}"`);
    } else {
      await window.electron.executeGitCommand(repoPath, `xdg-open "${selectedConflictFile}"`);
    }
    setStatusMessage('已在外部编辑器中打开文件，保存后将自动暂存');
  };

  const openDiffDialog = async () => {
    await loadBranches();
    setDiffSelectedBranch('');
    setDiffResult([]);
    setShowDiffDialog(true);
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
  };

  // Diff line type for rendering
  interface DiffLineData {
    content: string;
    type: 'unchanged' | 'added' | 'removed';
    leftLineNum?: number;
    rightLineNum?: number;
  }

  // Compute line-level diff between left and right content
  const computeLineDiff = (left: string, right: string): { leftLines: DiffLineData[]; rightLines: DiffLineData[] } => {
    const changes = Diff.diffLines(left, right);
    const leftLines: DiffLineData[] = [];
    const rightLines: DiffLineData[] = [];
    let leftNum = 0;
    let rightNum = 0;

    for (const change of changes) {
      const lines = change.value.replace(/\n$/, '').split('\n');
      if (change.added) {
        for (const line of lines) {
          rightNum++;
          rightLines.push({ content: line, type: 'added', rightLineNum: rightNum });
          leftLines.push({ content: '', type: 'removed' });
        }
      } else if (change.removed) {
        for (const line of lines) {
          leftNum++;
          leftLines.push({ content: line, type: 'removed', leftLineNum: leftNum });
          rightLines.push({ content: '', type: 'added' });
        }
      } else {
        for (const line of lines) {
          leftNum++;
          rightNum++;
          leftLines.push({ content: line, type: 'unchanged', leftLineNum: leftNum, rightLineNum: rightNum });
          rightLines.push({ content: line, type: 'unchanged', leftLineNum: leftNum, rightLineNum: rightNum });
        }
      }
    }
    return { leftLines, rightLines };
  };

  // Synchronized scrolling refs
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  const handleSyncScroll = useCallback((source: 'left' | 'right') => {
    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;

    const sourceEl = source === 'left' ? leftScrollRef.current : rightScrollRef.current;
    const targetEl = source === 'left' ? rightScrollRef.current : leftScrollRef.current;

    if (sourceEl && targetEl) {
      const ratio = sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight || 1);
      targetEl.scrollTop = ratio * (targetEl.scrollHeight - targetEl.clientHeight);
    }

    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  }, []);

  // Memoize diff computation - only recompute when content changes
  const computedDiff = useMemo(() => {
    if (!leftContent && !rightContent) return { leftLines: [] as DiffLineData[], rightLines: [] as DiffLineData[] };
    return computeLineDiff(leftContent, rightContent);
  }, [leftContent, rightContent]);

  // Switch diff file - content should already be preloaded in cache
  const handleDiffFileClick = (filePath: string) => {
    const cached = diffContentCache[filePath];
    if (cached) {
      setSelectedDiffFile(filePath);
      setLeftContent(cached.left);
      setRightContent(cached.right);
    }
  };

  const toggleDiffBranchSelection = (branchName: string) => {
    // If clicking the same branch, unselect it
    if (diffSelectedBranch === branchName) {
      setDiffSelectedBranch('');
    } else {
      // Select the clicked branch, compare with current branch
      setDiffSelectedBranch(branchName);
    }
  };

  const compareBranches = async () => {
    if (!diffSelectedBranch) {
      setStatusMessage('请选择一个分支进行比对');
      return;
    }

    setLoadingDiff(true);
    setStatusMessage(null);
    // Clear previous diff content cache
    setDiffContentCache({});

    try {
      // Get current branch name
      const currentBranchOutput = await window.electron.executeGitCommand(repoPath, 'git rev-parse --abbrev-ref HEAD');
      if (!currentBranchOutput.success) {
        setStatusMessage('获取当前分支名称失败');
        setLoadingDiff(false);
        return;
      }
      const currentBranch = currentBranchOutput.output.trim();
      const compareBranch = diffSelectedBranch;

      // Save branch names to state
      setCurrentBranchName(currentBranch);
      setCompareBranchName(compareBranch);

      // Get changed files between branches using git diff --name-only (fast, no content fetching)
      const diffOutput = await window.electron.executeGitCommand(repoPath, `git diff --name-only ${currentBranch} ${compareBranch}`);

      if (!diffOutput.success) {
        setStatusMessage('获取差异文件列表失败');
        setLoadingDiff(false);
        return;
      }

      const diffFiles = diffOutput.output.trim().split('\n').filter((f: string) => f.trim());
      const diffResult: { path: string; changed: boolean }[] = diffFiles.map((f: string) => ({
        path: f,
        changed: true,
      }));

      setDiffResult(diffResult);

      // If no changes, just show message in selection dialog
      if (diffResult.length === 0) {
        setStatusMessage(`${currentBranch} ↔ ${compareBranch}\n两个分支内容完全一致`);
        setLoadingDiff(false);
        setShowDiffDialog(false);
        return;
      }

      // Preload ALL files content in parallel before opening viewer
      // Note: left = compareBranch, right = currentBranch (current branch on the right)
      setStatusMessage('正在加载文件内容...');
      const preloadPromises = diffResult.map(async (item) => {
        const [left, right] = await Promise.all([
          getFileContentFromBranch(repoPath, compareBranch, item.path),
          getFileContentFromBranch(repoPath, currentBranch, item.path),
        ]);
        return { path: item.path, left, right };
      });

      const allContents = await Promise.all(preloadPromises);

      // Build cache
      const newCache: Record<string, { left: string; right: string }> = {};
      allContents.forEach(({ path, left, right }) => {
        newCache[path] = { left, right };
      });
      setDiffContentCache(newCache);

      // Now open diff viewer with first file selected
      setSelectedDiffFile(diffResult[0].path);
      setLeftContent(newCache[diffResult[0].path]?.left || '');
      setRightContent(newCache[diffResult[0].path]?.right || '');
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

  // Get file content from a specific branch using git show
  const getFileContentFromBranch = async (repoPath: string, branch: string, filePath: string): Promise<string> => {
    const output = await window.electron.executeGitCommand(repoPath, `git show ${branch}:${filePath}`);
    if (!output.success) {
      // File doesn't exist in this branch or other error
      // Return empty string to indicate "not present in this branch"
      return '';
    }
    return output.output;
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

  const openCommitPushDialog = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      // Get git status which gives us changed files
      const status = await window.electron.getGitStatus(repoPath);
      setGitStatusCache(status);
      const files = Object.keys(status.files);
      setChangedFiles(files);
      // Default select only files already staged (git add'ed)
      const defaultSelected = new Set<string>();
      files.forEach(file => {
        if (status.files[file]?.staged) {
          defaultSelected.add(file);
        }
      });
      setSelectedFiles(defaultSelected);
      // Get git user info
      const userInfo = await window.electron.getGitUserInfo(repoPath);
      setGitUser(userInfo);
      // Clear previous commit message
      setCommitMessage('');
      // Open dialog
      setShowCommitPushDialog(true);
    } catch (e) {
      console.error('Failed to open commit push dialog:', e);
      setStatusMessage(`打开失败: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleFileSelection = (filePath: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filePath)) {
      newSelected.delete(filePath);
    } else {
      newSelected.add(filePath);
    }
    setSelectedFiles(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === changedFiles.length) {
      // All selected - uncheck all
      setSelectedFiles(new Set());
    } else {
      // Select all
      setSelectedFiles(new Set(changedFiles));
    }
  };

  const handleCommitPush = async () => {
    // Validation
    if (selectedFiles.size === 0) {
      setStatusMessage('请至少选择一个要提交的文件');
      return;
    }
    if (!commitMessage.trim()) {
      setStatusMessage('请输入提交信息');
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      // git add selected files
      const selectedArray = Array.from(selectedFiles);
      // Quote each file path for spaces and special characters
      const quotedFiles = selectedArray.map(f => `"${f.replace(/"/g, '\\"')}"`).join(' ');
      const addOutput = await window.electron.executeGitCommand(repoPath, `git add ${quotedFiles}`);

      if (!addOutput.success) {
        setStatusMessage(`git add 失败: ${addOutput.output}`);
        return;
      }

      // git commit
      // Escape double quotes in commit message
      const escapedMessage = commitMessage.replace(/"/g, '\\"');
      const commitOutput = await window.electron.executeGitCommand(repoPath, `git commit -m "${escapedMessage}"`);

      if (!commitOutput.success) {
        setStatusMessage(`git commit 失败: ${commitOutput.output}`);
        return;
      }

      // git push
      const pushOutput = await window.electron.executeGitCommand(repoPath, 'git push');

      if (!pushOutput.success) {
        setStatusMessage(`git push 失败: ${pushOutput.output}`);
        return;
      }

      // Success
      setStatusMessage('提交并推送成功!');
      setStatusMessage(`提交并推送成功: ${commitOutput.output}\n${pushOutput.output}`);
      // Reload page after short delay to refresh git status
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (e) {
      console.error('Commit and push failed:', e);
      setStatusMessage(`执行失败: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCommitPushDialog = () => {
    setShowCommitPushDialog(false);
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'new': return 'text-green-600 dark:text-green-400';
      case 'modified': return 'text-blue-600 dark:text-blue-400';
      case 'deleted': return 'text-red-600 dark:text-red-400';
      case 'conflict': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return '新增';
      case 'modified': return '修改';
      case 'deleted': return '删除';
      case 'conflict': return '冲突';
      default: return '';
    }
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
            className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleClick(btn.id)}
            disabled={loading}
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

      {/* Merge Branch Selection Dialog */}
      {showMergeSelectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-[600px] max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">选择合并目标分支</h2>
              <button
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
                onClick={() => setShowMergeSelectDialog(false)}
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              当前分支 <span className="font-semibold text-blue-600">{mergeSelectedBranch}</span> 将被合并到选择的分支
            </p>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-2">
              {branches.filter(b => !b.isCurrent && !b.isRemote).map(branch => {
                const isSelected = mergeSelectedBranch === branch.name;
                return (
                  <div
                    key={branch.fullName}
                    className={`flex items-center gap-3 p-3 rounded cursor-pointer border ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => handleMergeSelectBranch(branch.name)}
                  >
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => handleMergeSelectBranch(branch.name)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-800 dark:text-gray-200">
                      {branch.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {branches.filter(b => !b.isCurrent && !b.isRemote).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                没有可合并的分支
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setShowMergeSelectDialog(false)}
              >
                取消
              </button>
              <button
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                onClick={executeMerge}
                disabled={!mergeSelectedBranch || loading}
              >
                {loading ? '合并中...' : '执行合并'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Result Dialog - shows merged files */}
      {showMergeResult && mergeResultFiles.length > 0 && (
        <div className={`fixed inset-0 ${isMergeMaximized ? '' : 'bg-black/50 flex items-center justify-center'} z-50`}>
          <div className={`bg-white dark:bg-gray-900 ${isMergeMaximized ? 'w-screen h-screen' : 'rounded-lg p-4 w-[90vw] h-[85vh]'} overflow-hidden flex flex-col`}>
            <div className={`flex justify-between items-center ${isMergeMaximized ? 'px-4 pt-3' : ''} mb-3`}>
              <h2 className="text-lg font-bold">
                成功合并到 <span className="text-blue-600">{mergeSelectedBranch}</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">只读</span>
                <button
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => setIsMergeMaximized(!isMergeMaximized)}
                >
                  {isMergeMaximized ? '🗗' : '🗖'}
                </button>
                <button
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => {
                    setShowMergeResult(false);
                    setIsMergeMaximized(false);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex flex-1 gap-3 overflow-hidden">
              {/* Left panel: merged files list */}
              <div className="w-56 flex-shrink-0 border border-gray-200 dark:border-gray-700 rounded overflow-y-auto">
                <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    合并文件 ({mergeResultFiles.length})
                  </h3>
                </div>
                <div className="space-y-0.5 px-1 py-1">
                  {mergeResultFiles.map(file => {
                    const isSelected = selectedMergeResultFile === file;
                    return (
                      <div
                        key={file}
                        className={`px-2 py-1 rounded cursor-pointer text-xs ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
                        }`}
                        onClick={async () => {
                          setSelectedMergeResultFile(file);
                          const diffOutput = await window.electron.executeGitCommand(repoPath, `git diff HEAD~1 HEAD -- "${file}"`);
                          setMergeDiffContent(diffOutput.output || '');
                        }}
                      >
                        {file}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right panel: diff content */}
              <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded overflow-y-auto">
                <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 z-10">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {selectedMergeResultFile}
                  </span>
                </div>
                <pre className="text-xs font-mono leading-5 p-2 overflow-x-auto">
                  <code>{mergeDiffContent || '选择文件查看变更'}</code>
                </pre>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  setShowMergeResult(false);
                  setIsMergeMaximized(false);
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Resolver Dialog */}
      {showConflictResolver && conflictFiles.length > 0 && (
        <div className={`fixed inset-0 ${isMergeMaximized ? '' : 'bg-black/50 flex items-center justify-center'} z-50`}>
          <div className={`bg-white dark:bg-gray-900 ${isMergeMaximized ? 'w-screen h-screen' : 'rounded-lg p-4 w-[90vw] h-[85vh]'} overflow-hidden flex flex-col`}>
            <div className={`flex justify-between items-center ${isMergeMaximized ? 'px-4 pt-3' : ''} mb-3`}>
              <h2 className="text-lg font-bold text-orange-600">
                ⚠️ 存在 {conflictFiles.length} 个冲突文件
              </h2>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 text-sm text-white bg-orange-500 rounded hover:bg-orange-600"
                  onClick={resolveAllConflicts}
                >
                  全部保留目标
                </button>
                <button
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => setIsMergeMaximized(!isMergeMaximized)}
                >
                  {isMergeMaximized ? '🗗' : '🗖'}
                </button>
                <button
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => {
                    setShowConflictResolver(false);
                    setIsMergeMaximized(false);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex flex-1 gap-3 overflow-hidden">
              {/* Left panel: conflict files list */}
              <div className="w-56 flex-shrink-0 border border-gray-200 dark:border-gray-700 rounded overflow-y-auto">
                <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    冲突文件 ({conflictFiles.length})
                  </h3>
                </div>
                <div className="space-y-0.5 px-1 py-1">
                  {conflictFiles.map(file => {
                    const isSelected = selectedConflictFile === file;
                    return (
                      <div
                        key={file}
                        className={`px-2 py-1 rounded cursor-pointer text-xs ${
                          isSelected
                            ? 'bg-orange-500 text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
                        }`}
                        onClick={() => loadConflictFile(file)}
                      >
                        {file}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right panel: conflict comparison */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex flex-1 gap-0 overflow-hidden">
                  {/* Left column: target branch (HEAD) */}
                  <div
                    className="flex-1 border border-gray-200 dark:border-gray-700 rounded-l overflow-y-auto"
                  >
                    <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 z-10">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        &lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD (目标分支)
                      </span>
                    </div>
                    <pre className="text-xs font-mono leading-5 p-2 overflow-x-auto">
                      <code>{conflictLeftContent}</code>
                    </pre>
                  </div>

                  {/* Divider */}
                  <div className="w-px bg-gray-300 dark:bg-gray-600 flex-shrink-0" />

                  {/* Right column: current branch */}
                  <div
                    className="flex-1 border border-gray-200 dark:border-gray-700 rounded-r overflow-y-auto"
                  >
                    <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 z-10">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        &gt;&gt;&gt;&gt;&gt;&gt;&gt; {mergeSelectedBranch} (当前分支)
                      </span>
                    </div>
                    <pre className="text-xs font-mono leading-5 p-2 overflow-x-auto">
                      <code>{conflictRightContent}</code>
                    </pre>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-3 mt-4 p-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => resolveConflict('ours')}
                  >
                    保留目标
                  </button>
                  <button
                    className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => resolveConflict('theirs')}
                  >
                    保留当前
                  </button>
                  <button
                    className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => openExternalEditor()}
                  >
                    手动编辑
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commit and Push Dialog */}
      {showCommitPushDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-[700px] max-h-[75vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">提交并推送</h2>
              <button
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
                onClick={handleCloseCommitPushDialog}
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">加载中...</div>
            ) : changedFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">没有可提交的变更</div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedFiles.size === changedFiles.length && changedFiles.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">全选/取消全选</span>
                  </label>

                  <div className="space-y-2 max-h-[30vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-2">
                    {changedFiles.map(filePath => {
                      const fileInfo = gitStatusCache.files?.[filePath];
                      const status = fileInfo?.status || 'normal';
                      const isSelected = selectedFiles.has(filePath);
                      const fileName = filePath.split('/').pop() || filePath;
                      const colorClass = getStatusColorClass(status);
                      const statusLabel = getStatusLabel(status);

                      return (
                        <div
                          key={filePath}
                          className={`flex items-center gap-2 p-2 rounded ${
                            isSelected ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFileSelection(filePath)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                                {fileName}
                              </span>
                              <span className={`text-xs ${colorClass}`}>
                                {statusLabel}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {filePath}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    提交信息
                  </label>
                  <textarea
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    onKeyDown={(e) => {
                      // Ctrl/Cmd + Enter to submit
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        handleCommitPush();
                      }
                    }}
                    placeholder="输入提交信息... (Ctrl/Cmd + Enter 提交)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]"
                  />
                </div>

                {gitUser.email && (
                  <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                    {gitUser.email}
                  </div>
                )}

                {statusMessage && (
                  <div className={`mb-4 p-3 rounded text-sm whitespace-pre-line ${
                    statusMessage.includes('成功')
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                  }`}>
                    {statusMessage}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={handleCloseCommitPushDialog}
                    disabled={loading}
                  >
                    取消
                  </button>
                  <button
                    className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    onClick={handleCommitPush}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCommitPush();
                      }
                    }}
                    disabled={loading}
                    autoFocus
                  >
                    {loading ? '执行中...' : '确认提交并推送'}
                  </button>
                </div>
              </>
            )}

            {copyToast && (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded text-sm z-50">
                {copyToast}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pull Result Dialog */}
      {showPullResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">拉取最新</h2>
              <button
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
                onClick={handleClosePullResult}
              >
                ✕
              </button>
            </div>

            <div className={`mb-6 p-4 rounded text-center ${
              pullIsSuccess
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
            }`}>
              <p className="text-lg">{pullResultMessage}</p>
            </div>

            <div className="flex justify-end">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={handleClosePullResult}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleClosePullResult();
                  }
                }}
                autoFocus
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    compareBranches();
                  }
                }}
                autoFocus
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

      {/* Diff Viewer Dialog - two panel comparison */}
      {showDiffViewer && (() => {
        const { leftLines, rightLines } = computedDiff;

        const getLineBgClass = (type: DiffLineData['type']): string => {
          switch (type) {
            case 'added': return 'bg-green-50 dark:bg-green-900/30';
            case 'removed': return 'bg-red-50 dark:bg-red-900/30';
            default: return '';
          }
        };

        const getLineNumBgClass = (type: DiffLineData['type']): string => {
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
                    {/* Left column: current branch content */}
                    <div
                      ref={leftScrollRef}
                      className="flex-1 border border-gray-200 dark:border-gray-700 rounded-l overflow-y-auto"
                      onScroll={() => handleSyncScroll('left')}
                    >
                      <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 z-10">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {compareBranchName}
                        </span>
                      </div>
                      {loadingDiff ? (
                        <div className="flex items-center justify-center h-32 text-gray-500">
                          <span className="animate-pulse">加载中...</span>
                        </div>
                      ) : (
                      <pre className="text-xs font-mono leading-5">
                        <code className="prism-code">
                          {leftLines.map((line, index) => (
                            <div key={index} className={`flex ${getLineBgClass(line.type)}`}>
                              <span className={`inline-block w-10 text-right pr-2 select-none flex-shrink-0 text-gray-400 text-xs ${getLineNumBgClass(line.type)}`}>
                                {line.leftLineNum ?? ''}
                              </span>
                              <span className="flex-1 pl-2 whitespace-pre" dangerouslySetInnerHTML={{
                                __html: line.content === '' ? '\u00A0' : highlight(line.content, selectedDiffFile)
                              }} />
                            </div>
                          ))}
                        </code>
                      </pre>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="w-px bg-gray-300 dark:bg-gray-600 flex-shrink-0" />

                    {/* Right column: current branch content */}
                    <div
                      ref={rightScrollRef}
                      className="flex-1 border border-gray-200 dark:border-gray-700 rounded-r overflow-y-auto"
                      onScroll={() => handleSyncScroll('right')}
                    >
                      <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 z-10">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {currentBranchName}
                        </span>
                      </div>
                      {loadingDiff ? (
                        <div className="flex items-center justify-center h-32 text-gray-500">
                          <span className="animate-pulse">加载中...</span>
                        </div>
                      ) : (
                      <pre className="text-xs font-mono leading-5">
                        <code className="prism-code">
                          {rightLines.map((line, index) => (
                            <div key={index} className={`flex ${getLineBgClass(line.type)}`}>
                              <span className={`inline-block w-10 text-right pr-2 select-none flex-shrink-0 text-gray-400 text-xs ${getLineNumBgClass(line.type)}`}>
                                {line.rightLineNum ?? ''}
                              </span>
                              <span className="flex-1 pl-2 whitespace-pre" dangerouslySetInnerHTML={{
                                __html: line.content === '' ? '\u00A0' : highlight(line.content, selectedDiffFile)
                              }} />
                            </div>
                          ))}
                        </code>
                      </pre>
                      )}
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

export default ButtonBar;
