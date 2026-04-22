# 提交并推送按钮功能设计

## 功能描述

在按钮模式下，点击「推送远程」按钮弹出提交并推送对话框：
- 显示所有未提交的变更文件，用户可通过复选框选择要提交的文件
- 提供输入框输入提交信息
- 显示当前 Git 配置的用户名和邮箱
- 确认后依次执行 `git add` → `git commit` → `git push` 操作推送到远程仓库

## 设计背景

原始设计文档中描述「点击对应按钮直接执行」，但实际使用中用户通常需要先选择要提交的文件并填写提交信息再推送，因此增加交互弹窗。

## 实现方案

### 架构

遵循现有代码模式，**方案 A**：在 `ButtonBar` 组件内直接实现弹窗，保持与「提交历史」「分支管理」相同的实现方式，改动最小。

### 新增状态（ButtonBar）

| 状态 | 类型 | 说明 |
|------|------|------|
| `showCommitPushDialog` | `boolean` | 控制弹窗显示/隐藏 |
| `changedFiles` | `string[]` | 所有变更文件列表 |
| `selectedFiles` | `Set<string>` | 用户选中的要提交的文件 |
| `commitMessage` | `string` | 用户输入的提交信息 |
| `gitUser` | `{ name: string; email: string }` | Git 配置的用户名和邮箱 |

### 新增方法（GitService）

- `getGitUserInfo(repoPath: string): Promise<{ name: string; email: string }>`
  - 执行 `git config --get user.name` 和 `git config --get user.email` 命令获取配置信息
  - 返回结果，若未配置则返回空字符串

### 新增 IPC 处理器（主进程 index.ts）

- `get-git-user-info` - 调用 `gitService.getGitUserInfo()` 获取用户信息

### 交互流程

1. **点击「推送远程」按钮**
   - 从 `window.electron.getGitStatus()` 获取所有变更文件
   - 从 `window.electron.getGitUserInfo()` 获取用户名和邮箱
   - 默认全选所有文件
   - 打开弹窗

2. **用户操作**
   - 点击单个文件复选框切换选中状态
   - 点击「全选/取消全选」切换所有文件选中状态
   - 在文本框输入提交信息
   - ESC 键关闭弹窗

3. **点击「确认提交并推送」**
   - 验证：至少选择一个文件且提交信息不为空
   - 执行 `git add <file1> <file2> ...`
   - 执行 `git commit -m "<commit message>"`
   - 执行 `git push`
   - 成功：显示成功信息，延迟 1 秒后关闭弹窗并刷新页面
   - 失败：显示错误信息，保留弹窗让用户修改

### UI 布局

```
┌─────────────────────────────────────┐
│  提交并推送                  ✕      │
├─────────────────────────────────────┤
│                                     │
│  [✓] 全选/取消全选                  │
│                                     │
│  [✓] src/App.tsx         (修改)  🔵 │
│  [✓] README.md           (新增)  🟢 │
│  [ ]  src/utils/helper.ts (删除)  🔴 │
│                                     │
│  提交信息：                          │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │ Add commit and push functionality││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  张三  •  zhang@example.com          │
│                                     │
│               [取消]  [确认提交并推送]│
└─────────────────────────────────────┘
```

### 文件状态颜色

复用现有的状态颜色规则：
- 🟢 新增 (new) - 绿色
- 🔵 修改 (modified) - 蓝色
- 🔴 删除 (deleted) - 红色
- 🟠 冲突 (conflict) - 橙色

### 错误处理

- 任何一步失败（add/commit/push）都在弹窗内显示错误信息
- 保留用户当前的选择和输入，方便修改后重试
- 不自动关闭弹窗

### 跨平台兼容性

- 使用 Electron 主进程 `spawn` 执行 git 命令，已处理 Windows/macOS 差异
- 文件路径使用引号包围，处理含空格的路径

## 涉及文件

| 文件 | 修改类型 | 说明 |
|------|----------|------|
| `src/main/git-service.ts` | 修改 | 新增 `getGitUserInfo` 方法 |
| `src/main/index.ts` | 修改 | 新增 IPC 处理器 `get-git-user-info` |
| `src/renderer/components/ButtonBar.tsx` | 修改 | 新增弹窗 UI 和逻辑 |
| `src/shared/types.ts` | 无需修改 | 已有类型足够 |

## 验收标准

- [ ] 点击推送远程按钮正确弹出对话框
- [ ] 正确显示所有变更文件，带复选框
- [ ] 全选/取消全选功能正常
- [ ] 正确显示 Git 配置的用户名和邮箱
- [ ] 输入提交信息后能正确执行 add/commit/push 流程
- [ ] 成功后自动刷新页面
- [ ] 失败显示错误信息
- [ ] ESC 键关闭弹窗
- [ ] 兼容 macOS 和 Windows
