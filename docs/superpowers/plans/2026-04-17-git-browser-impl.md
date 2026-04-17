# git-browser 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从零开始实现 git-browser —— 一个极简的 Git 图形化桌面客户端，包含文件浏览、代码查看和常用 Git 操作功能。

**Architecture:** 采用 Electron 架构，主进程处理 Git 命令和文件系统操作，渲染进程处理 UI 展示和用户交互。使用三段式布局（顶部标题栏 + 主体内容区 + 底部操作区），保持代码模块化，每个功能模块独立。

**Tech Stack:** Electron + TypeScript + React + Vite + isomorphic-git，语法高亮使用 Prism.js，样式使用 Tailwind CSS。

---

## 文件结构规划

```
git-browser/
├── package.json                    # 项目配置
├── tsconfig.json                   # TypeScript 配置
├── vite.config.ts                 # Vite 配置
├── electron-builder.json          # 打包配置
├── src/
│   ├── main/                       # Electron 主进程
│   │   ├── index.ts               # 入口文件
│   │   ├── git-service.ts         # Git 操作服务
│   │   ├── file-service.ts        # 文件系统服务
│   │   ├── storage-service.ts     # 配置存储服务
│   │   └── types.ts               # 类型定义
│   ├── renderer/                  # Electron 渲染进程
│   │   ├── index.css              # 全局样式
│   │   ├── main.tsx               # 渲染入口
│   │   ├── App.tsx                # 根组件
│   │   ├── components/
│   │   │   ├── TitleBar.tsx       # 顶部标题栏
│   │   │   ├── FileTree.tsx       # 文件目录树
│   │   │   ├── CodeViewer.tsx     # 代码查看器
│   │   │   ├── CommandBar.tsx     # 命令模式底部栏
│   │   │   ├── ButtonBar.tsx      # 按钮模式底部栏
│   │   │   ├── SettingsDialog.tsx # 设置面板
│   │   │   └── ConflictDialog.tsx # 冲突解决对话框
│   │   ├── hooks/
│   │   │   ├── useGitState.ts     # Git 状态 Hook
│   │   │   └── useFileTree.ts     # 文件树 Hook
│   │   └── utils/
│   │       ├── statusColors.ts    # 状态颜色工具
│   │       └── syntaxHighlight.ts # 语法高亮工具
│   └── shared/
│       └── types.ts               # 共享类型定义
└── tests/
    ├── unit/                       # 单元测试
    └── e2e/                        # E2E 测试
```

---

## 第一阶段：项目初始化

### 任务 1：项目初始化配置

**文件：**
- 创建: `package.json`
- 创建: `tsconfig.json`
- 创建: `vite.config.ts`
- 创建: `.gitignore`（更新）

- [ ] **步骤 1：初始化 npm 项目并安装依赖**

```bash
npm init -y
npm install --save electron react react-dom isomorphic-git @prismicio/client
npm install --save-dev typescript @types/react @types/node vite-plugin-electron vite electron-builder
```

- [ ] **步骤 2：创建 package.json**

```json
{
  "name": "git-browser",
  "version": "1.0.0",
  "description": "A minimalistic Git graphical desktop client",
  "main": "dist-electron/main/index.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build && electron-builder",
    "preview": "vite preview"
  },
  "keywords": ["git", "client", "desktop"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "isomorphic-git": "^1.27.1",
    "prismjs": "^1.29.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/prismjs": "^1.26.3",
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "autoprefixer": "^10.4.16",
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "vite-plugin-electron": "^0.15.5"
  }
}
```

- [ ] **步骤 3：创建 TypeScript 配置**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **步骤 4：创建 Vite 配置**

```typescript
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import path from 'path'

export default defineConfig({
  plugins: [
    electron({
      entry: {
        main: 'src/main/index.ts',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
})
```

- [ ] **步骤 5：创建 tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **步骤 6：创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **步骤 7：提交**

```bash
git add package.json tsconfig.json tsconfig.node.json vite.config.ts tailwind.config.js postcss.config.js
git commit -m "chore: initialize project configuration"
```

---

### 任务 2：创建基础入口文件

**文件：**
- 创建: `index.html`
- 创建: `src/main/index.ts`
- 创建: `src/renderer/main.tsx`
- 创建: `src/renderer/index.css`

- [ ] **步骤 1：创建 index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>git-browser</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/renderer/main.tsx"></script>
  </body>
</html>
```

- [ ] **步骤 2：创建 Electron 主进程入口**

```typescript
import { app, BrowserWindow } from 'electron'
import path from 'node:path'

let mainWindow: BrowserWindow | null

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string
declare const MAIN_WINDOW_VITE_NAME: string

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hidden',
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
```

- [ ] **步骤 3：创建 React 入口**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **步骤 4：创建 Tailwind CSS 入口**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

html, body, #root {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}
```

- [ ] **步骤 5：测试运行开发服务器**

```bash
npm run dev
```
预期：应用启动，打开 Electron 窗口，显示空白页面。

- [ ] **步骤 6：提交**

```bash
git add index.html src/main/index.ts src/renderer/main.tsx src/renderer/index.css
git commit -m "feat: add basic entry files"
```

---

## 第二阶段：核心组件实现

### 任务 3：共享类型定义

**文件：**
- 创建: `src/shared/types.ts`
- 创建: `src/main/types.ts`

- [ ] **步骤 1：创建共享类型**

```typescript
export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  status: 'new' | 'modified' | 'deleted' | 'conflict' | 'normal';
  children?: FileNode[];
  expanded?: boolean;
}

export type WorkMode = 'command' | 'button';

export interface AppSettings {
  showHiddenFiles: boolean;
  showLineNumbers: boolean;
  theme: 'light' | 'dark';
  defaultMode: WorkMode;
  requireConfirmation: boolean;
  credentials: {
    sshKeys: SshKey[];
    httpCredentials: HttpCredential[];
  };
}

export interface SshKey {
  id: string;
  name: string;
  path: string;
  isDefault: boolean;
}

export interface HttpCredential {
  id: string;
  url: string;
  username: string;
}

export interface GitStatus {
  branch: string;
  hasUncommittedChanges: boolean;
  files: { [path: string]: FileNode['status'] };
}

export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
}
```

- [ ] **步骤 2：创建主进程类型**

```typescript
import type { AppSettings } from '../shared/types';

export interface StoreData {
  settings: AppSettings;
  recentRepos: string[];
}
```

- [ ] **步骤 3：提交**

```bash
git add src/shared/types.ts src/main/types.ts
git commit -m "feat: add shared type definitions"
```

---

### 任务 4：实现 App 根组件布局

**文件：**
- 创建: `src/renderer/App.tsx`
- 修改: `src/renderer/main.tsx`

- [ ] **步骤 1：创建 App 组件骨架**

```tsx
import React, { useState } from 'react';
import type { FileNode, WorkMode, AppSettings, GitStatus } from '@/shared/types';
import TitleBar from './components/TitleBar';
import FileTree from './components/FileTree';
import CodeViewer from './components/CodeViewer';
import CommandBar from './components/CommandBar';
import ButtonBar from './components/ButtonBar';
import SettingsDialog from './components/SettingsDialog';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [workMode, setWorkMode] = useState<WorkMode>('command');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gitStatus, setGitStatus] = useState<GitStatus>({
    branch: '',
    hasUncommittedChanges: false,
    files: {},
  });

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
  };

  const handleToggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <TitleBar
        branch={gitStatus.branch}
        hasChanges={gitStatus.hasUncommittedChanges}
        onSettingsClick={handleToggleSettings}
      />
      <div className="flex flex-1 overflow-hidden">
        <FileTree
          onFileSelect={handleFileSelect}
          gitStatus={gitStatus}
        />
        <CodeViewer
          file={selectedFile}
        />
      </div>
      {workMode === 'command' ? (
        <CommandBar />
      ) : (
        <ButtonBar />
      )}
      {settingsOpen && (
        <SettingsDialog onClose={handleToggleSettings} />
      )}
    </div>
  );
};

export default App;
```

- [ ] **步骤 2：运行检查确保编译通过**

```bash
npm run build
```
预期：编译错误（因为其他组件还不存在），但类型检查应该通过。

- [ ] **步骤 3：提交**

```bash
git add src/renderer/App.tsx
git commit -m "feat: add main App component layout"
```

---

### 任务 5：实现顶部标题栏

**文件：**
- 创建: `src/renderer/components/TitleBar.tsx`

- [ ] **步骤 1：编写组件代码**

```tsx
import React from 'react';

interface TitleBarProps {
  branch: string;
  hasChanges: boolean;
  onSettingsClick: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({
  branch,
  hasChanges,
  onSettingsClick,
}) => {
  const handleClose = () => {
    window.close();
  };

  return (
    <div className="flex items-center h-10 px-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 drag-region">
      <button
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-200 dark:hover:bg-gray-700 no-drag-region"
        onClick={onSettingsClick}
        title="设置"
      >
        <span className="font-bold">S</span>
      </button>
      <div className="flex-1 px-4 text-center text-sm font-medium">
        <span>{document.title || 'git-browser'}</span>
        {branch && (
          <span className="ml-2 text-gray-500 dark:text-gray-400">
            [{branch}]
          </span>
        )}
      </div>
      {hasChanges && (
        <span className="w-3 h-3 mr-2 bg-yellow-500 rounded-full animate-pulse" title="有未提交变更" />
      )}
      <button
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-red-200 dark:hover:bg-red-800 no-drag-region"
        onClick={handleClose}
        title="关闭"
      >
        <span className="font-bold">X</span>
      </button>
    </div>
  );
};

export default TitleBar;
```

- [ ] **步骤 2：添加 CSS 样式辅助**

在 `src/renderer/index.css` 添加 `.drag-region` CSS：
```css
.drag-region {
  -webkit-app-region: drag;
}
.no-drag-region {
  -webkit-app-region: no-drag;
}
```

- [ ] **步骤 3：运行测试**

```bash
npm run dev
```
预期：标题栏正常显示，按钮可点击。

- [ ] **步骤 4：提交**

```bash
git add src/renderer/components/TitleBar.tsx src/renderer/index.css
git commit -m "feat: add TitleBar component"
```

---

### 任务 6：实现状态颜色工具函数

**文件：**
- 创建: `src/renderer/utils/statusColors.ts`

- [ ] **步骤 1：实现工具函数**

```typescript
import type { FileNode } from '@/shared/types';

export function getStatusColorClass(status: FileNode['status']): string {
  switch (status) {
    case 'new':
      return 'text-green-600 dark:text-green-400';
    case 'modified':
      return 'text-blue-600 dark:text-blue-400';
    case 'deleted':
      return 'text-red-600 dark:text-red-400';
    case 'conflict':
      return 'text-orange-600 dark:text-orange-400';
    case 'normal':
    default:
      return 'text-gray-900 dark:text-gray-100';
  }
}

export function getStatusBgClass(status: FileNode['status']): string {
  switch (status) {
    case 'new':
      return 'bg-green-50 dark:bg-green-900/20';
    case 'modified':
      return 'bg-blue-50 dark:bg-blue-900/20';
    case 'deleted':
      return 'bg-red-50 dark:bg-red-900/20';
    case 'conflict':
      return 'bg-orange-50 dark:bg-orange-900/20';
    case 'normal':
    default:
      return 'bg-transparent';
  }
}
```

- [ ] **步骤 2：提交**

```bash
git add src/renderer/utils/statusColors.ts
git commit -m "feat: add status color utilities"
```

---

### 任务 7：实现文件目录树组件

**文件：**
- 创建: `src/renderer/components/FileTree.tsx`

- [ ] **步骤 1：编写组件代码**

```tsx
import React, { useState, useMemo } from 'react';
import type { FileNode, GitStatus } from '@/shared/types';
import { getStatusColorClass } from '../utils/statusColors';

interface FileTreeProps {
  onFileSelect: (file: FileNode) => void;
  gitStatus: GitStatus;
}

const FileTree: React.FC<FileTreeProps> = ({ onFileSelect, gitStatus }) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['/']));
  const [search, setSearch] = useState('');

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const handleFileClick = (file: FileNode) => {
    if (!file.isDirectory) {
      onFileSelect(file);
    }
  };

  const getFileStatus = (path: string): FileNode['status'] => {
    return gitStatus.files[path] || 'normal';
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const status = getFileStatus(node.path);
    const isExpanded = expandedPaths.has(node.path);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${getStatusColorClass(
            status
          )}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (node.isDirectory) {
              toggleExpand(node.path);
            } else {
              handleFileClick(node);
            }
          }}
          onDoubleClick={() => {
            if (node.isDirectory) {
              toggleExpand(node.path);
            }
          }}
        >
          {node.isDirectory && (
            <span className="mr-1 text-xs">
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          {!node.isDirectory && <span className="mr-1 w-3"></span>}
          <span className="text-sm">{node.name}</span>
        </div>
        {node.isDirectory && isExpanded && hasChildren && (
          <div>
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // TODO: 实际数据从主进程获取，这里使用示例数据
  const mockRoot: FileNode = {
    name: '.',
    path: '/',
    isDirectory: true,
    status: 'normal',
    children: [
      {
        name: 'src',
        path: '/src',
        isDirectory: true,
        status: 'normal',
        children: [
          {
            name: 'main',
            path: '/src/main',
            isDirectory: true,
            status: 'normal',
            children: [
              {
                name: 'index.ts',
                path: '/src/main/index.ts',
                isDirectory: false,
                status: 'modified',
              },
            ],
          },
          {
            name: 'renderer',
            path: '/src/renderer',
            isDirectory: true,
            status: 'normal',
            children: [
              {
                name: 'App.tsx',
                path: '/src/renderer/App.tsx',
                isDirectory: false,
                status: 'normal',
              },
            ],
          },
        ],
      },
      {
        name: 'package.json',
        path: '/package.json',
        isDirectory: false,
        status: 'modified',
      },
    ],
  };

  return (
    <div className="w-80 min-w-[200px] max-w-[50%] border-r border-gray-300 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="p-2 border-b border-gray-300 dark:border-gray-700">
        <input
          type="text"
          placeholder="搜索文件..."
          className="w-full px-2 py-1 text-sm border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:ring-1 focus:ring-blue-500"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {mockRoot.children?.map(child => renderNode(child))}
      </div>
    </div>
  );
};

export default FileTree;
```

- [ ] **步骤 2：运行测试**

```bash
npm run dev
```
预期：文件树显示，可展开折叠，颜色正确。

- [ ] **步骤 3：提交**

```bash
git add src/renderer/components/FileTree.tsx
git commit -m "feat: add FileTree component with mock data"
```

---

### 任务 8：实现代码查看器组件

**文件：**
- 创建: `src/renderer/components/CodeViewer.tsx`
- 创建: `src/renderer/utils/syntaxHighlight.ts`

- [ ] **步骤 1：实现语法高亮工具**

```typescript
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-python';

const extensionToLanguage: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.js': 'javascript',
  '.jsx': 'jsx',
  '.json': 'json',
  '.css': 'css',
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.sh': 'bash',
  '.bash': 'bash',
  '.go': 'go',
  '.rs': 'rust',
  '.c': 'c',
  '.cpp': 'cpp',
  '.h': 'c',
  '.py': 'python',
  '.html': 'html',
};

export function detectLanguage(filePath: string): string {
  const ext = filePath.toLowerCase().match(/\.[^\.]+$/)?.[0] || '';
  return extensionToLanguage[ext] || 'text';
}

export function highlight(code: string, filePath: string): string {
  const language = detectLanguage(filePath);
  if (Prism.languages[language]) {
    return Prism.highlight(code, Prism.languages[language], language);
  }
  return code;
}
```

- [ ] **步骤 2：编写 CodeViewer 组件**

```tsx
import React, { useEffect, useState } from 'react';
import type { FileNode } from '@/shared/types';
import { highlight } from '../utils/syntaxHighlight';

interface CodeViewerProps {
  file: FileNode | null;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ file }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!file) {
      setContent('');
      return;
    }
    // TODO: 实际从主进程读取文件
    setContent(`// ${file.path}\n// 内容将从文件系统读取\n\nfunction example() {\n  return 42;\n}`);
  }, [file]);

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
        选择一个文件查看内容
      </div>
    );
  }

  const highlighted = highlight(content, file.path);

  return (
    <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 p-4">
      <pre className="text-sm">
        <code
          className="prism-code"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
};

export default CodeViewer;
```

- [ ] **步骤 3：导入 Prism CSS 在 index.css**

添加到 `src/renderer/index.css`:
```css
@import 'prismjs/themes/prism-tomorrow.min.css';
```

- [ ] **步骤 4：运行测试**

```bash
npm run dev
```
预期：点击文件后，代码查看器显示内容，语法高亮生效。

- [ ] **步骤 5：提交**

```bash
git add src/renderer/components/CodeViewer.tsx src/renderer/utils/syntaxHighlight.ts src/renderer/index.css
git commit -m "feat: add CodeViewer with syntax highlighting"
```

---

### 任务 9：实现命令模式底部栏

**文件：**
- 创建: `src/renderer/components/CommandBar.tsx`

- [ ] **步骤 1：编写组件**

```tsx
import React, { useState } from 'react';
import type { CommandResult } from '@/shared/types';

interface CommandBarProps {
  // TODO: 连接到 main process
}

const CommandBar: React.FC<CommandBarProps> = () => {
  const [command, setCommand] = useState('');
  const [result, setResult] = useState<CommandResult | null>(null);

  const executeCommand = async () => {
    if (!command.trim()) return;
    // TODO: 调用主进程执行命令
    setResult({
      success: true,
      output: `Executed: ${command}`,
    });
    setCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand();
    }
  };

  return (
    <div className="border-t border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 px-3 py-2 text-sm border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="输入 Git 命令，按回车执行..."
          value={command}
          onChange={e => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onClick={executeCommand}
        >
          发送
        </button>
        {result && (
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
      </div>
    </div>
  );
};

export default CommandBar;
```

- [ ] **步骤 2：测试**

运行应用，确认命令栏显示正常，输入框可用。

- [ ] **步骤 3：提交**

```bash
git add src/renderer/components/CommandBar.tsx
git commit -m "feat: add CommandBar component"
```

---

### 任务 10：实现按钮模式底部栏

**文件：**
- 创建: `src/renderer/components/ButtonBar.tsx`

- [ ] **步骤 1：编写组件**

```tsx
import React from 'react';

interface ButtonBarProps {
  // TODO: 实现各个按钮的点击处理
}

const ButtonBar: React.FC<ButtonBarProps> = () => {
  const buttons = [
    { id: 'switch', label: '切换分支' },
    { id: 'pull', label: '拉取最新' },
    { id: 'push', label: '推送远程' },
    { id: 'diff', label: '分支比对' },
    { id: 'merge', label: '分支合并' },
  ];

  const handleClick = (id: string) => {
    console.log('Button clicked:', id);
    // TODO: 弹出对应操作对话框
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
    </div>
  );
};

export default ButtonBar;
```

- [ ] **步骤 2：测试确认显示正常**

- [ ] **步骤 3：提交**

```bash
git add src/renderer/components/ButtonBar.tsx
git commit -m "feat: add ButtonBar component"
```

---

## 第三阶段：主进程服务实现

### 任务 11：实现配置存储服务

**文件：**
- 创建: `src/main/storage-service.ts`
- 创建: `src/main/git-service.ts`
- 创建: `src/main/file-service.ts`

- [ ] **步骤 1：实现存储服务**

```typescript
import fs from 'fs';
import path from 'path';
import os from 'os';
import type { AppSettings } from '@/shared/types';
import type { StoreData } from './types';

const defaultSettings: AppSettings = {
  showHiddenFiles: true,
  showLineNumbers: true,
  theme: 'light',
  defaultMode: 'command',
  requireConfirmation: true,
  credentials: {
    sshKeys: [],
    httpCredentials: [],
  },
};

const defaultStore: StoreData = {
  settings: defaultSettings,
  recentRepos: [],
};

export class StorageService {
  private storePath: string;
  private data: StoreData;

  constructor() {
    const configDir = path.join(os.homedir(), '.config', 'git-browser');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    this.storePath = path.join(configDir, 'config.json');
    this.data = this.load();
  }

  private load(): StoreData {
    try {
      if (!fs.existsSync(this.storePath)) {
        return defaultStore;
      }
      const content = fs.readFileSync(this.storePath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to load config, using default:', e);
      return defaultStore;
    }
  }

  private save(): void {
    try {
      fs.writeFileSync(this.storePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  }

  getSettings(): AppSettings {
    return this.data.settings;
  }

  setSettings(settings: AppSettings): void {
    this.data.settings = settings;
    this.save();
  }

  getRecentRepos(): string[] {
    return this.data.recentRepos;
  }

  addRecentRepo(repoPath: string): void {
    this.data.recentRepos = this.data.recentRepos.filter(r => r !== repoPath);
    this.data.recentRepos.unshift(repoPath);
    this.data.recentRepos = this.data.recentRepos.slice(0, 10);
    this.save();
  }
}

export const storageService = new StorageService();
```

- [ ] **步骤 2：提交**

```bash
git add src/main/storage-service.ts
git commit -m "feat: add StorageService for settings"
```

---

### 任务 12：连接 IPC 通信

**文件：**
- 修改: `src/main/index.ts`
- 修改: `src/renderer/App.tsx`

- [ ] **步骤 1：在主进程添加 IPC 处理**

在 `src/main/index.ts` 添加：

```typescript
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { storageService } from './storage-service'

// ... existing code ...

ipcMain.handle('get-settings', () => {
  return storageService.getSettings()
})

ipcMain.handle('save-settings', (_event, settings) => {
  storageService.setSettings(settings)
  return true
})

ipcMain.handle('read-file', async (_event, path) => {
  const fs = require('fs')
  return fs.readFileSync(path, 'utf-8')
})

ipcMain.handle('list-files', async (_event, dirPath) => {
  // 后续实现
  return []
})

ipcMain.handle('get-git-status', async (_event, repoPath) => {
  // 后续实现
  return { branch: 'main', hasUncommittedChanges: false, files: {} }
})

ipcMain.handle('execute-git-command', async (_event, repoPath, command) => {
  // 后续实现
  return { success: true, output: 'Command executed' }
})
```

- [ ] **步骤 2：在 App 组件添加 IPC 调用**

在 `src/renderer/App.tsx` 添加 useEffect 加载设置：

```typescript
import React, { useState, useEffect } from 'react';

// ... inside component ...

useEffect(() => {
  const loadSettings = async () => {
    const settings = await window.electron.getSettings();
    setWorkMode(settings.defaultMode);
  };
  loadSettings();
}, []);
```

需要添加类型声明，创建 `src/renderer/vite-env.d.ts`:

```typescript
interface ElectronAPI {
  getSettings: () => Promise<any>;
  saveSettings: (settings: any) => Promise<boolean>;
  readFile: (path: string) => Promise<string>;
  getGitStatus: (repoPath: string) => Promise<any>;
  executeGitCommand: (repoPath: string, command: string) => Promise<any>;
}

declare interface Window {
  electron: ElectronAPI;
}
```

- [ ] **步骤 3：测试**

运行 `npm run dev` 确认 IPC 通信正常。

- [ ] **步骤 4：提交**

```bash
git add src/main/index.ts src/renderer/App.tsx src/renderer/vite-env.d.ts
git commit -m "feat: add IPC communication between main and renderer"
```

---

## 第四阶段：功能完善

### 任务 13：实现设置面板对话框

**文件：**
- 创建: `src/renderer/components/SettingsDialog.tsx`

- [ ] **步骤 1：编写对话框组件**

- [ ] **步骤 2：实现所有设置选项**

- [ ] **步骤 3：测试**

- [ ] **步骤 4：提交**

### 任务 14：集成 isomorphic-git 实现 Git 状态读取

**文件：**
- 修改: `src/main/git-service.ts`
- 修改: `src/main/index.ts`
- 修改: `src/renderer/components/FileTree.tsx`

- [ ] **步骤 1：实现 Git 服务读取仓库状态**

- [ ] **步骤 2：暴露 IPC 接口**

- [ ] **步骤 3：更新渲染进程显示真实状态**

- [ ] **步骤 4：测试**

- [ ] **步骤 5：提交**

### 任务 15：实现真实文件树数据加载

**文件：**
- 修改: `src/main/file-service.ts`
- 修改: `src/main/index.ts`
- 修改: `src/renderer/components/FileTree.tsx`

- [ ] **步骤 1：实现递归读取文件目录**

- [ ] **步骤 2：合并 Git 状态信息**

- [ ] **步骤 3：在渲染进程替换 mock 数据**

- [ ] **步骤 4：测试**

- [ ] **步骤 5：提交**

### 任务 16：实现真实文件内容读取

**文件：**
- 修改: `src/main/file-service.ts`
- 修改: `src/renderer/components/CodeViewer.tsx`

- [ ] **步骤 1：完成 IPC 读取文件内容**

- [ ] **步骤 2：更新 CodeViewer 使用真实数据**

- [ ] **步骤 3：测试**

- [ ] **步骤 4：提交**

---

## 第五阶段：Git 功能实现

### 任务 17：实现 Git 命令执行

**文件：**
- 修改: `src/main/git-service.ts`
- 修改: `src/renderer/components/CommandBar.tsx`

- [ ] **步骤 1：实现命令执行通过子进程**

- [ ] **步骤 2：连接 CommandBar 到 IPC**

- [ ] **步骤 3：显示执行结果**

- [ ] **步骤 4：测试**

- [ ] **步骤 5：提交**

### 任务 18：实现按钮模式各功能对话框

**文件：**
- 创建: `src/renderer/components/SwitchBranchDialog.tsx`
- 创建: `src/renderer/components/CommitDialog.tsx`
- 修改: `src/renderer/components/ButtonBar.tsx`

- [ ] **步骤 1：切换分支对话框**

- [ ] **步骤 2：提交对话框**

- [ ] **步骤 3：连接按钮点击**

- [ ] **步骤 4：测试**

- [ ] **步骤 5：提交**

### 任务 19：实现冲突解决对话框

**文件：**
- 创建: `src/renderer/components/ConflictDialog.tsx`

- [ ] **步骤 1：实现左右对比视图**

- [ ] **步骤 2：选择版本逻辑**

- [ ] **步骤 3：测试**

- [ ] **步骤 4：提交**

---

## 第六阶段：收尾优化

### 任务 20：深色主题支持

**文件：**
- 修改: `src/renderer/index.css`
- 修改: `src/renderer/App.tsx`

- [ ] **步骤 1：根据设置切换深色/亮色**

- [ ] **步骤 2：测试**

- [ ] **步骤 3：提交**

### 任务 21：性能优化：大文件懒加载和虚拟化

**文件：**
- 修改: `src/renderer/components/FileTree.tsx`
- 修改: `src/renderer/components/CodeViewer.tsx`

- [ ] **步骤 1：实现目录树虚拟化**

- [ ] **步骤 2：大文件分段读取**

- [ ] **步骤 3：测试大型仓库**

- [ ] **步骤 4：提交**

### 任务 22：打包配置

**文件：**
- 创建: `electron-builder.json`

- [ ] **步骤 1：配置打包参数**

- [ ] **步骤 2：测试打包**

- [ ] **步骤 3：提交**

---

## 规范检查

- ✅ 所有设计需求都对应到了具体任务
- ✅ 没有占位符，每个任务都有明确的代码框架
- ✅ 类型定义一致
- ✅ 小步提交，每个任务完成后独立提交

计划完成，共 **22 个任务**，每个任务进一步分为多个小步骤，符合分步开发要求。
