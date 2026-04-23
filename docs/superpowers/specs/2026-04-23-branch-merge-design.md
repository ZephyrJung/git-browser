# 分支合并功能设计

## 概述

实现分支合并功能，在按键模式下点击"分支合并"按钮，通过弹窗选择目标分支，将当前分支合并到目标分支。无冲突时显示合并产生的文件清单；有冲突时进入交互式冲突解决模式。

## 交互流程

```
用户点击"分支合并"按钮
    ↓
弹出 BranchSelectionDialog（分支选择）
    ↓
选择目标分支，确认
    ↓
执行: git checkout <目标分支> && git merge <当前分支>
    ↓
检查结果
    ├─ 有冲突 → 进入 ConflictResolverDialog
    └─ 无冲突 → 进入 MergeResultDialog
```

## 组件设计

### 1. BranchSelectionDialog（分支选择）

- 基于现有 `BranchList` 对话框改造
- 单选模式，显示所有分支
- 排除当前分支（不可选择）
- 确认按钮执行合并

### 2. MergeResultDialog（合并结果，无冲突）

- **顶部**：标题 "成功合并到 `<目标分支>`"
- **左侧**：文件树（FileTree 组件），显示合并产生的文件
- **右侧**：CodeViewer 展示选中文件的 diff
- **底部**：关闭按钮
- **只读模式**

### 3. ConflictResolverDialog（冲突解决）

- **顶部**：警告提示 "存在 N 个冲突文件"
- **左侧**：冲突文件列表（只显示 `U` 状态文件）
- **右侧**：左右两栏对比视图
  - 左栏标签：`<<<<<<< HEAD (目标分支)`
  - 右栏标签：`>>>>>>> <当前分支>`
- **操作按钮**：
  - `保留目标` → 将目标分支版本写入工作区 + `git add`
  - `保留当前` → 将当前分支版本写入工作区 + `git add`
  - `手动编辑` → 打开文本编辑器
- **全部解决后**：显示成功提示，文件树刷新

## IPC 命令

| 操作 | 命令 |
|------|------|
| 执行合并 | `git checkout <target> && git merge <current>` |
| 获取冲突文件 | `git status --porcelain` |
| 解决冲突（保留目标） | `git checkout --ours <file>` + `git add <file>` |
| 解决冲突（保留当前） | `git checkout --theirs <file>` + `git add <file>` |
| 获取文件 diff | `git diff <file>` 或读取临时文件 |

## 数据流

### 合并成功时

```
git checkout target && git merge current
    ↓
git diff --name-only HEAD~1 HEAD
    ↓
显示 MergeResultDialog
```

### 合并失败时（冲突）

```
git checkout target && git merge current
    ↓
检测 'U' 状态 或 error output
    ↓
git status --porcelain 获取冲突文件列表
    ↓
显示 ConflictResolverDialog
    ↓
用户逐个解决 → git checkout --ours/--theirs + git add
    ↓
所有冲突解决 → 显示成功提示
```

## UI 布局

### MergeResultDialog

```
┌─────────────────────────────────────────────────────────────┐
│  成功合并到 main                              [只读] [关闭]  │
├──────────────────────┬──────────────────────────────────────┤
│ 文件树               │ Diff 视图                            │
│                      │                                       │
│ 📁 src/              │ - const a = 1;                        │
│   📄 index.ts        │ + const a = 2;                        │
│   📄 App.tsx         │   console.log(a);                     │
│ 📁 components/       │                                       │
│   📄 Button.tsx      │                                       │
│                      │                                       │
├──────────────────────┴──────────────────────────────────────┤
│                                    [关闭]                    │
└─────────────────────────────────────────────────────────────┘
```

### ConflictResolverDialog

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ 存在 3 个冲突文件                    [全部保留目标] [关闭] │
├──────────────────────┬──────────────────────────────────────┤
│ 冲突文件             │ <<<<<<< HEAD (目标分支)               │
│                      │   function foo() {                    │
│ ☑️ src/a.ts          │ -    return 1;                        │
│ ☐ src/b.ts          │ +    return 2;                         │
│ ☐ src/c.ts          │   }                                    │
│                      │ =======                               │
│                      │   function foo() {                    │
│                      │ -    return 3;                        │
│                      │ +    return 4;                        │
│                      │   }                                    │
│                      │ >>>>>>> feature-branch                 │
├──────────────────────┴──────────────────────────────────────┤
│  [保留目标] [保留当前] [手动编辑]                             │
└─────────────────────────────────────────────────────────────┘
```

## 文件变更

- `src/renderer/components/ButtonBar.tsx` - 添加 MergeResultDialog 和 ConflictResolverDialog
- `src/main/index.ts` - 添加 merge 相关 IPC handler
- `src/main/git-service.ts` - 添加 merge 与冲突解决方法（如需要）

## 约束

- 所有 git 操作通过 `execute-git-command` IPC 执行
- 不自动提交，合并结果保留在工作区
- 冲突解决必须逐个文件确认
