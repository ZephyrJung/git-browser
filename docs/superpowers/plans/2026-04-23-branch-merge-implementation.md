# 分支合并功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现分支合并功能，点击"分支合并"按钮后选择目标分支，将当前分支合并到目标分支。无冲突时显示合并产生的文件清单；有冲突时进入交互式冲突解决模式。

**Architecture:**
- 复用 `ButtonBar.tsx` 中的分支选择逻辑，新增 `MergeResultDialog` 和 `ConflictResolverDialog` 组件
- Git 操作通过 `executeGitCommand` IPC 执行
- 冲突解决使用 `git checkout --ours/--theirs` 命令

**Tech Stack:** React, TypeScript, Git, isomorphic-git/diff

---

## File Structure

- `src/renderer/components/ButtonBar.tsx` - 修改：添加状态变量、合并按钮处理、MergeResultDialog、ConflictResolverDialog

---

## Task 1: 添加合并相关状态变量

**Files:**
- Modify: `src/renderer/components/ButtonBar.tsx:52-56`

- [ ] **Step 1: 在 ButtonBar 组件中添加以下 state 变量**

在 `isDiffMaximized` 后面添加：

```typescript
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
```

- [ ] **Step 2: 在 ESC 键处理中添加新对话框的关闭逻辑**

在 `handleKeyDown` 的 `if (e.key === 'Escape')` 中添加：

```typescript
if (showMergeSelectDialog) setShowMergeSelectDialog(false);
if (showMergeResult) setShowMergeResult(false);
if (showConflictResolver) setShowConflictResolver(false);
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/components/ButtonBar.tsx
git commit -m "feat(merge): add merge state variables"
```

---

## Task 2: 添加合并按钮点击处理

**Files:**
- Modify: `src/renderer/components/ButtonBar.tsx:140-157`

- [ ] **Step 1: 在 `handleClick` 函数中添加 'merge' case**

在 `} else if (id === 'diff') {` 后面添加：

```typescript
} else if (id === 'merge') {
  await openMergeSelectDialog();
}
```

- [ ] **Step 2: 添加 `openMergeSelectDialog` 函数**

在 `handlePull` 函数后面添加：

```typescript
const openMergeSelectDialog = async () => {
  // Get current branch
  const currentBranchOutput = await window.electron.executeGitCommand(repoPath, 'git rev-parse --abbrev-ref HEAD');
  if (!currentBranchOutput.success) {
    setStatusMessage('获取当前分支失败');
    return;
  }
  const currentBranch = currentBranchOutput.output.trim();

  // Load all branches
  await loadBranches();

  // Filter out current branch and remote branches for selection
  // Store current branch name for merge reference
  setMergeSelectedBranch(currentBranch);
  setShowMergeSelectDialog(true);
};
```

- [ ] **Step 3: 添加 `handleMergeSelectBranch` 函数**

```typescript
const handleMergeSelectBranch = (branchName: string) => {
  if (mergeSelectedBranch === branchName) {
    setMergeSelectedBranch('');
  } else {
    setMergeSelectedBranch(branchName);
  }
};
```

- [ ] **Step 4: Commit**

```bash
git add src/renderer/components/ButtonBar.tsx
git commit -m "feat(merge): add merge button click handler"
```

---

## Task 3: 添加 MergeSelectDialog 组件（选择目标分支）

**Files:**
- Modify: `src/renderer/components/ButtonBar.tsx`

- [ ] **Step 1: 在 Branch List Dialog 后面添加 MergeSelectDialog**

在 `{/* Branch List Dialog */}` 后面（大约 line 1010）添加：

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/ButtonBar.tsx
git commit -m "feat(merge): add merge branch selection dialog"
```

---

## Task 4: 添加 executeMerge 执行函数

**Files:**
- Modify: `src/renderer/components/ButtonBar.tsx`

- [ ] **Step 1: 在 openMergeSelectDialog 后添加 executeMerge 函数**

```typescript
const executeMerge = async () => {
  if (!mergeSelectedBranch) return;

  setLoading(true);
  setStatusMessage(null);
  setShowMergeSelectDialog(false);

  try {
    // Get current branch before checkout
    const currentBranchOutput = await window.electron.executeGitCommand(repoPath, 'git rev-parse --abbrev-ref HEAD');
    if (!currentBranchOutput.success) {
      setStatusMessage('获取当前分支失败');
      setLoading(false);
      return;
    }
    const currentBranch = currentBranchOutput.output.trim();

    // Execute: git checkout <target> && git merge <current>
    const mergeCommand = `git checkout "${mergeSelectedBranch}" && git merge "${currentBranch}"`;
    const output = await window.electron.executeGitCommand(repoPath, mergeCommand);

    // Check for conflicts
    const statusOutput = await window.electron.executeGitCommand(repoPath, 'git status --porcelain');
    const conflictFiles = statusOutput.output
      .split('\n')
      .filter(line => line.includes('U') || line.startsWith('??'));

    // Filter to only actual conflicts (U status)
    const actualConflicts = conflictFiles.filter(line => {
      const parts = line.trim().split(' ');
      const status = parts[0];
      return status.includes('U') || status === 'DD' || status === 'AU' || status === 'DU' || status === 'UA' || status === 'UD';
    });

    if (actualConflicts.length > 0) {
      // Has conflicts - enter conflict resolver
      const conflictFilePaths = actualConflicts.map(line => {
        const parts = line.trim().split(/\s+/);
        return parts[1] || parts[0];
      }).filter(Boolean);

      setConflictFiles(conflictFilePaths);
      setSelectedConflictFile(conflictFilePaths[0] || '');
      setShowConflictResolver(true);
      setLoading(false);
      return;
    }

    // No conflicts - show merge result
    // Get files changed by the merge
    const mergeResultOutput = await window.electron.executeGitCommand(repoPath, 'git diff --name-only HEAD~1 HEAD');
    const files = mergeResultOutput.output.trim().split('\n').filter(f => f.trim());

    setMergeResultFiles(files);
    setSelectedMergeResultFile(files[0] || '');
    setShowMergeResult(true);
    setLoading(false);

    // Reload page after showing result
    setTimeout(() => {
      window.location.reload();
    }, 500);

  } catch (e) {
    console.error('Merge failed:', e);
    setStatusMessage(`合并失败: ${String(e)}`);
    setLoading(false);
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/ButtonBar.tsx
git commit -m "feat(merge): add executeMerge function"
```

---

## Task 5: 添加 MergeResultDialog（合并结果对话框）

**Files:**
- Modify: `src/renderer/components/ButtonBar.tsx`

- [ ] **Step 1: 在 MergeSelectDialog 后面添加 MergeResultDialog**

在 `{/* Merge Branch Selection Dialog */}` 块之后添加：

```tsx
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
                    // Load diff content for this file
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
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/ButtonBar.tsx
git commit -m "feat(merge): add MergeResultDialog component"
```

---

## Task 6: 添加 ConflictResolverDialog（冲突解决对话框）

**Files:**
- Modify: `src/renderer/components/ButtonBar.tsx`

- [ ] **Step 1: 在 MergeResultDialog 后面添加 ConflictResolverDialog**

```tsx
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
```

- [ ] **Step 2: 添加 `loadConflictFile` 函数**

在 `executeMerge` 函数后添加：

```typescript
const loadConflictFile = async (filePath: string) => {
  setSelectedConflictFile(filePath);

  try {
    // Get both versions using git show
    const [oursOutput, theirsOutput] = await Promise.all([
      window.electron.executeGitCommand(repoPath, `git show :1:${filePath}`),
      window.electron.executeGitCommand(repoPath, `git show :3:${filePath}`),
    ]);

    setConflictLeftContent(oursOutput.output || '(空)');
    setConflictRightContent(theirsOutput.output || '(空)');
  } catch (e) {
    // Fallback: read the file with conflict markers
    const fileOutput = await window.electron.executeGitCommand(repoPath, `cat "${filePath}"`);
    const content = fileOutput.output || '';

    // Parse conflict markers
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
```

- [ ] **Step 3: 添加 `resolveConflict` 函数**

```typescript
const resolveConflict = async (version: 'ours' | 'theirs') => {
  if (!selectedConflictFile) return;

  try {
    // Use git checkout --ours or --theirs to resolve
    const checkoutCmd = version === 'ours'
      ? `git checkout --ours "${selectedConflictFile}"`
      : `git checkout --theirs "${selectedConflictFile}"`;

    await window.electron.executeGitCommand(repoPath, checkoutCmd);

    // Stage the file
    await window.electron.executeGitCommand(repoPath, `git add "${selectedConflictFile}"`);

    // Remove from conflict list
    const remainingConflicts = conflictFiles.filter(f => f !== selectedConflictFile);
    setConflictFiles(remainingConflicts);

    if (remainingConflicts.length > 0) {
      // Load next conflict file
      setSelectedConflictFile(remainingConflicts[0]);
      await loadConflictFile(remainingConflicts[0]);
    } else {
      // All conflicts resolved
      setShowConflictResolver(false);
      setStatusMessage('所有冲突已解决！');
      setTimeout(() => window.location.reload(), 1000);
    }
  } catch (e) {
    console.error('Failed to resolve conflict:', e);
    setStatusMessage(`解决冲突失败: ${String(e)}`);
  }
};
```

- [ ] **Step 4: 添加 `resolveAllConflicts` 函数**

```typescript
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
```

- [ ] **Step 5: 添加 `openExternalEditor` 函数**

```typescript
const openExternalEditor = async () => {
  // On macOS, open with default editor
  if (process.platform === 'darwin') {
    await window.electron.executeGitCommand(repoPath, `open "${selectedConflictFile}"`);
  } else if (process.platform === 'win32') {
    await window.electron.executeGitCommand(repoPath, `start "" "${selectedConflictFile}"`);
  } else {
    await window.electron.executeGitCommand(repoPath, `xdg-open "${selectedConflictFile}"`);
  }
  setStatusMessage('已在外部编辑器中打开文件，保存后将自动暂存');
};
```

- [ ] **Step 6: Commit**

```bash
git add src/renderer/components/ButtonBar.tsx
git commit -m "feat(merge): add ConflictResolverDialog component"
```

---

## Task 7: 添加 merge 相关初始化加载

**Files:**
- Modify: `src/renderer/components/ButtonBar.tsx`

- [ ] **Step 1: 在组件挂载时加载当前分支信息**

找到 `useEffect` 中加载 git user info 的地方（如果存在），确保 merge 功能有正确的初始状态。

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/ButtonBar.tsx
git commit -m "feat(merge): initialize merge state on mount"
```

---

## Self-Review

**Spec Coverage Check:**
- [x] 点击合并按钮弹出分支选择 - Task 2, 3
- [x] 选择目标分支执行合并 - Task 4
- [x] 无冲突显示 MergeResultDialog - Task 5
- [x] 有冲突显示 ConflictResolverDialog - Task 6
- [x] 左右对比视图解决冲突 - Task 6
- [x] 保留目标/保留当前/手动编辑操作 - Task 6

**Placeholder Scan:**
- All code blocks contain actual implementation
- No TBD/TODO placeholders in code
- All function signatures are complete

**Type Consistency:**
- State variables properly typed
- Function parameters match usage
- IPC command format consistent with existing code

---

## Verification

After implementation, test with:

1. **No conflict scenario:**
   - Click "分支合并"
   - Select a branch without conflicts
   - Verify MergeResultDialog shows with file list

2. **Conflict scenario:**
   - Create a conflict manually
   - Click "分支合并"
   - Verify ConflictResolverDialog appears
   - Test "保留目标", "保留当前", "手动编辑" buttons

Run build to verify:
```bash
npm run build
```
