# CLAUDE.md

本文档为 Claude Code 在本仓库工作时提供指导。

## 基本要求

- 所有git指令手动完成，不允许自动执行
- **跨平台兼容性**：所有代码改造必须同时兼容 **macOS** 和 **Windows** 两个系统，重点注意 shell 引号格式、路径分隔符、命令行参数等差异

## 项目概述

git-browser 是一个极简的 Git 图形化桌面客户端，专注于代码浏览和日常 Git 操作。项目遵循简洁优先的设计理念：只满足日常开发 80% 的常见需求，不追求覆盖所有 Git 高级功能。

**当前状态**：第一阶段（项目初始化 + 基础 UI 框架）已完成，可构建运行。

## 仓库结构

```
git-browser/
├── CLAUDE.md              # 本文档 - Claude Code 开发指南
├── package.json           # npm 配置
├── tsconfig.json          # TypeScript 配置
├── tsconfig.node.json
├── vite.config.ts         # Vite 配置
├── tailwind.config.js     # Tailwind CSS 配置
├── postcss.config.js
├── index.html             # HTML 入口
├── README.md              # 极简项目描述
├── .gitignore             # Git 忽略配置
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── index.ts       # 主入口 + IPC 处理器
│   │   ├── storage-service.ts  # 配置存储服务
│   │   ├── git-service.ts      # Git 操作服务（占位）
│   │   ├── file-service.ts     # 文件系统服务（占位）
│   │   └── types.ts          # 主进程类型定义
│   ├── renderer/          # Electron 渲染进程
│   │   ├── main.tsx      # React 入口
│   │   ├── App.tsx       # 根组件
│   │   ├── index.css     # 全局样式
│   │   ├── vite-env.d.ts # 类型声明
│   │   ├── components/
│   │   │   ├── TitleBar.tsx       # 顶部标题栏
│   │   │   ├── FileTree.tsx       # 文件目录树（带标签+搜索）
│   │   │   ├── CodeViewer.tsx     # 代码查看器（带路径信息条）
│   │   │   ├── CommandBar.tsx     # 命令模式底部栏
│   │   │   ├── ButtonBar.tsx      # 按钮模式底部栏
│   │   │   └── SettingsDialog.tsx # 设置对话框（占位）
│   │   └── utils/
│   │       ├── statusColors.ts    # 文件状态颜色工具
│   │       └── syntaxHighlight.ts # 语法高亮工具
│   └── shared/
│       └── types.ts       # 共享类型定义
└── ui-design/             # UI 设计文档和资源
│   ├── design.md          # 完整 UI 设计规范 (中文)
│   ├── design.eddx        # Enterprise Architect 设计文件
│   └── assets/            # UI 设计截图
├── dist/                  # 构建输出 - 渲染进程
└── dist-electron/         # 构建输出 - 主进程
```

## 设计架构

### 最终布局（已实现）
三段式布局：
- **顶部标题栏**：左侧 macOS 红绿灯留出空间，中间项目名称 + 当前分支，右侧 ⚙ 设置菜单
- **主体内容区**：左侧 - 文件目录树（宽度可拖动调整），右侧 - 代码浏览器
  - 文件树顶部：三个标签页（文件/暂存区/收藏） + 最右侧搜索按钮 🔍
  - 代码区顶部：信息条显示当前分支 + 文件完整路径，点击展开最近打开文件下拉
- **底部操作区**：命令输入框（命令模式）或操作按钮（按钮模式）

### 核心功能（来自设计规范）
1. **文件浏览**：支持大型仓库的虚拟化树视图、模糊搜索、状态颜色标记
2. **代码浏览**：支持 10+ 种语言语法高亮、行号显示、文件内搜索
3. **两种工作模式**：
   - 命令模式：直接输入 Git 命令，执行结果反馈
   - 按钮模式：常用操作预设按钮（切换分支、拉取、推送、合并、对比）
4. **Git 功能**：提交、分支管理、Diff 查看、冲突解决、历史浏览（待实现）
5. **设置**：加密凭证存储（SSH/HTTP）、显示选项、主题切换（待实现）
6. **状态可视化**：文件状态颜色编码：绿色（新增）、红色（删除）、蓝色（修改）、橙色（冲突）

### 技术设计原则
- 性能：大文件懒加载、目录树虚拟化渲染
- 安全：加密凭证存储、危险操作二次确认
- 跨平台：目标为桌面应用程序

## 技术栈

- **运行时**：Electron 桌面应用
- **框架**：React 18 + TypeScript + Vite
- **样式**：Tailwind CSS
- **Git 集成**：isomorphic-git
- **语法高亮**：Prism.js
- **打包**：electron-builder

## 常用命令

- 安装依赖：`npm install`
- 开发模式运行：`npm run dev`
- 生产构建：`npm run build`

## 设计文档

所有 UI/UX 需求都记录在 `ui-design/design.md`（中文）中。开始实现新功能前请阅读该文件以了解完整规范。

## 当前进度

- ✅ 第一阶段：项目初始化配置完成
- ✅ 所有基础 UI 组件框架完成
- ✅ 可成功构建运行
- ✅ 第二阶段：主进程服务实现完成（git-service、file-service、storage-service）
- 🔄 第三阶段：Git 功能开发（进行中）
