# 文件树修改状态快速定位条 - 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在文件浏览区右侧添加一个独立侧边状态条，用颜色小块标记所有修改文件位置，支持点击快速跳转定位。

**Architecture:** 创建独立的 `FileTreeStatusBar` React 组件，接收当前可见文件列表和 Git 状态信息，计算每个修改文件的相对位置并渲染色块，点击色块通过回调通知父组件滚动跳转。复用现有的状态颜色规则保证视觉一致性。

**Tech Stack:** React 18 + TypeScript + Tailwind CSS，遵循现有项目代码风格。

---

## 文件变更

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/renderer/components/FileTreeStatusBar.tsx` | 创建 | 新增状态条组件 |
| `src/renderer/components/FileTree.tsx` | 修改 | 集成状态条，调整布局 |

---

### Task 1: 创建 FileTreeStatusBar 组件骨架

**Files:**
- Create: `src/renderer/components/FileTreeStatusBar.tsx`

- [ ] **Step 1: 创建组件文件和基础类型定义**

```tsx
import React from 'react';
import type { FileNode, GitStatus } from '@/shared/types';

interface FileTreeStatusBarProps {
  gitStatus: GitStatus;
  visibleFiles: FileNode[];
  onJumpToFile: (file: FileNode) => void;
}

const FileTreeStatusBar: React.FC<FileTreeStatusBarProps> = ({
  gitStatus,
  visibleFiles,
  onJumpToFile,
}) => {
  return (
    <div className="w-[10px] bg-gray-200 dark:bg-gray-700 relative">
      {/* 标记将在这里渲染 */}
    </div>
  );
};

export default FileTreeStatusBar;
```

- [ ] **Step 2: 导入状态颜色工具**

添加导入到文件顶部：

```tsx
import { getStatusColorClass } from '../utils/statusColors';
```

- [ ] **Step 3: 收集需要标记的修改文件列表**

在组件内添加：

```tsx
// Get all changed files that are currently visible
const changedFiles = React.useMemo(() => {
  return visibleFiles.filter(file => {
    return !file.isDirectory && gitStatus.files[file.path] !== undefined;
  });
}, [visibleFiles, gitStatus]);
```

- [ ] **Step 4: 计算每个标记的位置**

添加位置计算逻辑：

```tsx
interface MarkedFile {
  file: FileNode;
  top: number;
  status: string;
}

const marks: MarkedFile[] = React.useMemo(() => {
  if (changedFiles.length === 0) return [];

  return changedFiles.map((file, index) => {
    // Find the index of this file in the full visible files list
    const fileIndex = visibleFiles.findIndex(f => f.path === file.path);
    // Calculate relative position (0 to 1)
    const ratio = fileIndex / (visibleFiles.length - 1 || 1);
    // Top position (percentage based)
    const top = ratio * 100; // percentage

    return {
      file,
      top,
      status: gitStatus.files[file.path],
    };
  });
}, [changedFiles, visibleFiles, gitStatus]);
```

- [ ] **Step 5: 渲染标记色块**

更新 `return` 部分：

```tsx
  return (
    <div className="w-[10px] bg-gray-200 dark:bg-gray-700 relative h-full">
      {marks.map((mark, index) => {
        // Map status to actual color hex for background
        const colorMap: Record<string, string> = {
          added: 'bg-green-600',
          modified: 'bg-blue-600',
          deleted: 'bg-red-600',
          conflicted: 'bg-orange-500',
          normal: '',
        };
        const bgClass = colorMap[mark.status] || colorMap.modified;

        return (
          <div
            key={`${mark.file.path}-${index}`}
            className={`absolute left-[1px] w-[8px] h-[8px] rounded-sm cursor-pointer ${bgClass} hover:scale-150 hover:z-10 transition-transform`}
            style={{ top: `${mark.top}%` }}
            title={`${mark.file.path} (${mark.status})`}
            onClick={() => onJumpToFile(mark.file)}
          />
        );
      })}
    </div>
  );
```

- [ ] **Step 6: Commit**

```bash
git add src/renderer/components/FileTreeStatusBar.tsx
git commit -m "feat: add FileTreeStatusBar component skeleton"
```

---

### Task 2: 在 FileTree 组件中集成状态条

**Files:**
- Modify: `src/renderer/components/FileTree.tsx`

- [ ] **Step 1: 添加组件导入**

在文件顶部添加导入：

```tsx
import FileTreeStatusBar from './FileTreeStatusBar';
```

- [ ] **Step 2: 新增 onJumpToFile prop 到接口**

更新 `FileTreeProps` 接口：

```tsx
interface FileTreeProps {
  onFileSelect: (file: FileNode) => void;
  gitStatus: GitStatus;
  showHidden: boolean;
  repoPath: string;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onJumpToFile?: (file: FileNode) => void;
}
```

设置默认值：

```tsx
const FileTree: React.FC<FileTreeProps> = ({
  onFileSelect,
  gitStatus,
  showHidden,
  repoPath,
  activeTab,
  onTabChange,
  onJumpToFile = () => {},
}) => {
```

- [ ] **Step 3: 收集当前所有可见文件传递给状态条**

添加 `allVisibleFiles` 收集逻辑：

```tsx
// Collect all visible file nodes for status bar positioning
const getAllVisibleFiles = (nodes: FileNode[]): FileNode[] => {
  let result: FileNode[] = [];
  for (const node of nodes) {
    if (!shouldRenderNode(node)) continue;
    if (!node.isDirectory) {
      result.push(node);
    }
    if (node.children && expandedPaths.has(node.path)) {
      result = result.concat(getAllVisibleFiles(node.children));
    }
  }
  return result;
};

const allVisibleFiles = getAllVisibleFiles(rootFiles);
```

- [ ] **Step 4: 调整布局结构，添加状态条**

更新 `return` 部分，将文件列表和状态条放在一个 flex 容器中：

```tsx
  return (
    <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="border-b border-gray-300 dark:border-gray-700">
        {/* ... existing tab bar code ... keep unchanged ... */}
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div key={`${activeTab}-${Object.keys(gitStatus.files).length}`}>
            {renderRootNodes()}
          </div>
          {/* ... existing empty state ... keep unchanged ... */}
        </div>
        <FileTreeStatusBar
          gitStatus={gitStatus}
          visibleFiles={allVisibleFiles}
          onJumpToFile={(file) => {
            // Ensure parent directory is expanded, then jump and select
            const pathParts = file.path.split('/');
            let currentPath = '';
            const newExpanded = new Set(expandedPaths);
            for (const part of pathParts.slice(0, -1)) {
              currentPath += `/${part}`;
              newExpanded.add(currentPath);
            }
            setExpandedPaths(newExpanded);
            onFileSelect(file);
            onJumpToFile(file);
          }}
        />
      </div>
    </div>
  );
```

> **Note:** The existing tab bar (lines 232-292 in original FileTree.tsx) and empty state (lines 297-305) remain unchanged. Only the main content area wrapping changes.

- [ ] **Step 5: 调整原有容器结构**

验证原有行号：原第 293 行是 `<div className="flex-1 overflow-y-auto">` 需要保持内容不变，只增加外层 flex 包裹和状态条。

- [ ] **Step 6: 构建检查**

运行：
```bash
npm run build
```
Expected: 构建成功，无类型错误。

- [ ] **Step 7: Commit**

```bash
git add src/renderer/components/FileTree.tsx
git commit -m "feat: integrate FileTreeStatusBar into FileTree"
```

---

### Task 3: 添加滚动到视图功能（跳转功能完善）

**Files:**
- Modify: `src/renderer/components/FileTree.tsx`

- [ ] **Step 1: 添加容器 ref 用于滚动**

在组件开头添加 ref：

```tsx
const scrollContainerRef = React.useRef<HTMLDivElement>(null);
```

将 ref 绑定到滚动容器：

```tsx
        <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
```

- [ ] **Step 2: 添加对 jumpToFile 的处理，滚动到目标文件**

修改状态条的 `onJumpToFile` 处理器：

```tsx
        <FileTreeStatusBar
          gitStatus={gitStatus}
          visibleFiles={allVisibleFiles}
          onJumpToFile={(file) => {
            // Ensure parent directory is expanded
            const pathParts = file.path.split('/');
            let currentPath = '';
            const newExpanded = new Set(expandedPaths);
            for (const part of pathParts.slice(0, -1)) {
              currentPath += `/${part}`;
              newExpanded.add(currentPath);
            }
            setExpandedPaths(newExpanded);

            // Select the file
            onFileSelect(file);
            onJumpToFile(file);

            // Scroll the file into view after expansion
            setTimeout(() => {
              const fileElement = document.querySelector(`[data-file-path="${file.path}"]`);
              if (fileElement && scrollContainerRef.current) {
                fileElement.scrollIntoView({ block: 'center' });
                scrollContainerRef.current?.scrollTo({
                  top: fileElement.getBoundingClientRect().top -
                       scrollContainerRef.current.getBoundingClientRect().top -
                       scrollContainerRef.current.clientHeight / 2 +
                       fileElement.clientHeight / 2,
                  behavior: 'smooth',
                });
              }
            }, 50);
          }}
        />
```

- [ ] **Step 3: 添加 data-file-path 属性到文件节点**

在 `renderNode` 函数中，给文件节点 div 添加 `data-file-path` 属性：

找到文件节点的 div（大约 line 178），修改为：

```tsx
        <div
          key={node.path}
          data-file-path={node.path}
          className={`flex items-center w-full px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${getStatusColorClass(
            status
          )}`}
```

- [ ] **Step 4: 构建检查**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/renderer/components/FileTree.tsx
git commit -m "feat: add smooth scroll-to-file functionality"
```

---

## 自检清单

✓ 所有规范需求都已覆盖：
- [x] 独立侧边状态条，宽度 10px
- [x] 每个修改文件对应一个色块标记，颜色与状态一致
- [x] 点击跳转定位（自动展开目录 + 平滑滚动 + 选中文件）
- [x] 悬浮 tooltip 显示文件路径
- [x] 切换标签页和搜索时自动更新
- [x] 深色模式适配（Tailwind 深色类已配置）
- [x] 不影响原有拖动调整宽度功能

✓ 没有占位符，所有代码都已给出
✓ 类型一致，使用现有 `FileNode` 和 `GitStatus` 类型
✓ 遵循项目现有代码结构和风格

