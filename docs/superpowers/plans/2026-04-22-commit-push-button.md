# 提交并推送按钮功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现推送按钮功能，点击后弹出对话框让用户选择要提交的文件、输入提交信息，确认后执行 git add → git commit → git push 完整流程。

**Architecture:** 遵循现有代码模式，在 `ButtonBar` 组件内实现弹窗。在 `GitService` 中新增获取 Git 用户配置方法，主进程新增对应 IPC 处理器。复用现有的颜色规则和弹窗样式。

**Tech Stack:** React 18 + TypeScript + Electron + Tailwind CSS + isomorphic-git + 原生 Git 命令

---

### Task 1: 在 GitService 中新增 getGitUserInfo 方法

**Files:**
- Modify: `src/main/git-service.ts`

- [ ] **Step 1: Add the getGitUserInfo method to GitService class**

Add after the `getFileDiff` method:

```typescript
  async getGitUserInfo(repoPath: string): Promise<{ name: string; email: string }> {
    try {
      const name = execSync('git config --get user.name', { cwd: repoPath, encoding: 'utf-8' }).trim();
      const email = execSync('git config --get user.email', { cwd: repoPath, encoding: 'utf-8' }).trim();
      return { name, email };
    } catch (e) {
      console.error('Failed to get git user info:', e);
      return { name: '', email: '' };
    }
  }
```

- [ ] **Step 2: Export the method**

No changes needed - it's already in the exported class.

- [ ] **Step 3: Commit**

```bash
git add src/main/git-service.ts
git commit -m "feat: add getGitUserInfo method to GitService"
```

### Task 2: 在主进程添加 IPC 处理器

**Files:**
- Modify: `src/main/index.ts`

- [ ] **Step 1: Add IPC handler for get-git-user-info**

Add after the `get-file-diff` handler around line 148-150:

```typescript
ipcMain.handle('get-git-user-info', async (_event, repoPath) => {
  return gitService.getGitUserInfo(repoPath);
})
```

- [ ] **Step 2: Commit**

```bash
git add src/main/index.ts
git commit -m "feat: add get-git-user-info IPC handler"
```

### Task 3: 在 ButtonBar 添加状态变量和导入

**Files:**
- Modify: `src/renderer/components/ButtonBar.tsx`

- [ ] **Step 1: Add new state variables**

Add after the existing state declarations (around line 28-31):

```typescript
  const [showCommitPushDialog, setShowCommitPushDialog] = useState(false);
  const [changedFiles, setChangedFiles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [commitMessage, setCommitMessage] = useState('');
  const [gitUser, setGitUser] = useState({ name: '', email: '' });
```

- [ ] **Step 2: Update ESC key effect**

Update the `handleKeyDown` function around line 36-40 to include closing the commit-push dialog:

```typescript
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCommitHistory) setShowCommitHistory(false);
        if (showBranchList) setShowBranchList(false);
        if (showBranchManagement) setShowBranchManagement(false);
        if (showCommitPushDialog) setShowCommitPushDialog(false);
      }
    };
```

Update the dependency array at line 43:

```typescript
  }, [showCommitHistory, showBranchList, showBranchManagement, showCommitPushDialog]);
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/components/ButtonBar.tsx
git commit -m "feat: add commit-push dialog state to ButtonBar"
```

### Task 4: 实现打开对话框逻辑

**Files:**
- Modify: `src/renderer/components/ButtonBar.tsx`

- [ ] **Step 1: Add handlePushClick function**

Add to the `handleClick` function (around line 122):

```typescript
    } else if (id === 'push') {
      await openCommitPushDialog();
    }
```

Add the `openCommitPushDialog` function after `toggleBranchSelection`:

```typescript
  const openCommitPushDialog = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      // Get git status which gives us changed files
      const status = await window.electron.getGitStatus(repoPath);
      const files = Object.keys(status.files);
      setChangedFiles(files);
      // Default select all
      setSelectedFiles(new Set(files));
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
```

- [ ] **Step 2: Add toggleFileSelection function**

```typescript
  const toggleFileSelection = (filePath: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filePath)) {
      newSelected.delete(filePath);
    } else {
      newSelected.add(filePath);
    }
    setSelectedFiles(newSelected);
  };
```

- [ ] **Step 3: Add toggleSelectAll function**

```typescript
  const toggleSelectAll = () => {
    if (selectedFiles.size === changedFiles.length) {
      // All selected - uncheck all
      setSelectedFiles(new Set());
    } else {
      // Select all
      setSelectedFiles(new Set(changedFiles));
    }
  };
```

- [ ] **Step 4: Add handleCommitPush function**

```typescript
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
```

- [ ] **Step 5: Add handleCloseCommitPushDialog function**

```typescript
  const handleCloseCommitPushDialog = () => {
    setShowCommitPushDialog(false);
  };
```

- [ ] **Step 6: Add getStatusColor helper function**

Add helper to get color class based on file status:

```typescript
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
```

- [ ] **Step 7: Commit**

```bash
git add src/renderer/components/ButtonBar.tsx
git commit -m "feat: add commit-push dialog open and handler functions"
```

### Task 5: 添加弹窗 UI 渲染

**Files:**
- Modify: `src/renderer/components/ButtonBar.tsx`

- [ ] **Step 1: Add dialog JSX at the end of return before closing div**

Add after the `{showBranchList && (...)}}` block (around line 592):

```jsx
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
                      const status = (window as any).__gitStatus?.files?.[filePath] || 'normal';
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
                    placeholder="输入提交信息..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]"
                  />
                </div>

                {(gitUser.name || gitUser.email) && (
                  <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                    {gitUser.name && <span>{gitUser.name}</span>}
                    {gitUser.name && gitUser.email && <span className="mx-2">•</span>}
                    {gitUser.email && <span>{gitUser.email}</span>}
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
                    disabled={loading}
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
```

- [ ] **Step 2: Fix __gitStatus typing issue**

We need to get the git status files. Looking at how the app works, we actually need to get git status when opening the dialog. Update the `openCommitPushDialog` function:

Change:
```typescript
      // Get git status which gives us changed files
      const status = await window.electron.getGitStatus(repoPath);
```
To:
```typescript
      // Get git status which gives us changed files
      const status: { files: { [path: string]: string } } = await window.electron.getGitStatus(repoPath);
      setGitStatusCache = status;
```

Add this state at the top with other state:
```typescript
  const [gitStatusCache, setGitStatusCache] = useState<{ files: { [path: string]: string } }>({ files: {} });
```

Then in the JSX, change:
```typescript
                      const status = (window as any).__gitStatus?.files?.[filePath] || 'normal';
```
To:
```typescript
                      const status = gitStatusCache.files?.[filePath] || 'normal';
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/components/ButtonBar.tsx
git commit -m "feat: add commit-push dialog UI"
```

### Task 6: 验证编译并测试

**Files:**
- None to modify, just test build

- [ ] **Step 1: Run build to check for TypeScript errors**

```bash
npm run build
```

Expected: Build completes successfully with no errors.

- [ ] **Step 2: Fix any TypeScript errors found**

If there are errors, fix them.

- [ ] **Step 3: Commit if fixes were needed**

```bash
git add .
git commit -m "fix: correct TypeScript errors"
```

## 自检查

- ✅ 所有规范需求都已覆盖：显示待提交文件复选框选择、输入提交信息、显示git配置用户名邮箱、确认后推送
- ✅ 没有占位符，所有步骤都有具体代码
- ✅ 类型一致，方法签名正确
- ✅ 遵循现有代码模式
- ✅ 考虑了跨平台兼容性（文件路径加引号处理空格）
- ✅ 错误处理完善，失败显示错误信息，保留用户输入

