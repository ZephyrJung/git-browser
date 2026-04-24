# 命令补全实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 CommandBar 添加 zsh 风格的 git 别名展开和基于历史记录的智能补全功能

**Architecture:** 在 CommandBar 组件中添加别名定义和历史记录状态，输入时实时匹配候选词，通过下拉列表展示，右方向键采纳补全

**Tech Stack:** React (现有), localStorage (历史持久化)

---

## 文件结构

- 修改: `src/renderer/components/CommandBar.tsx` (主要实现文件)

---

## Task 1: 添加别名定义和展开逻辑

**Files:**
- Modify: `src/renderer/components/CommandBar.tsx`

- [ ] **Step 1: 在组件内添加别名定义常量**

在组件开头（其他常量/类型定义之后）添加：

```typescript
// Git 命令别名 - 参考 zsh git 插件
const GIT_ALIASES: Record<string, string> = {
  // 基础操作
  'ga': 'git add',
  'gaa': 'git add --all',
  'gax': 'git add --patch',
  'gau': 'git add --update',
  'gap': 'git add --patch',

  // commit 相关
  'gc': 'git commit',
  'gca': 'git commit --amend',
  'gcm': 'git commit --message',
  'gcam': 'git commit -a --message',
  'gcf': 'git commit --fixup',
  'gcs': 'git commit -S',

  // push/pull/fetch
  'gp': 'git push',
  'gpf': 'git push --force-with-lease',
  'gpF': 'git push --force',
  'gpa': 'git push --all',
  'gpt': 'git push --tags',
  'gfl': 'git pull',
  'gfa': 'git fetch --all',
  'gf': 'git fetch',

  // checkout/branch
  'gco': 'git checkout',
  'gcob': 'git checkout -b',
  'gcom': 'git checkout main',
  'gcod': 'git checkout develop',
  'gb': 'git branch',
  'gba': 'git branch -a',
  'gbd': 'git branch -d',
  'gbD': 'git branch -D',

  // status/log/diff
  'gst': 'git status',
  'gss': 'git status -s',
  'gl': 'git log',
  'glo': 'git log --oneline',
  'glg': 'git log --graph',
  'glga': 'git log --graph --all --decorate',
  'gld': 'git log --pretty=format:"%h %ad %s" --date=short',
  'gd': 'git diff',
  'gds': 'git diff --staged',
  'gdn': 'git diff --name-only',
  'gdc': 'git diff --cached',

  // merge/rebase
  'gm': 'git merge',
  'gma': 'git merge --abort',
  'gmc': 'git merge --continue',
  'gr': 'git rebase',
  'gra': 'git rebase --abort',
  'grc': 'git rebase --continue',
  'gri': 'git rebase --interactive',

  // stash
  'gstsh': 'git stash',
  'gstshp': 'git stash pop',
  'gstshl': 'git stash list',
  'gstshd': 'git stash drop',

  // reset
  'grh': 'git reset',
  'grhh': 'git reset --hard',
  'grhs': 'git reset --soft',

  // clean
  'gcl': 'git clean',
  'gcln': 'git clean -n',
  'gclf': 'git clean -fd',

  // other
  'gbl': 'git blame',
  'gsh': 'git show',
  'gshs': 'git show --stat',
  'gt': 'git tag',
  'gta': 'git tag -a',
  'grev': 'git revert',
  'gcp': 'git cherry-pick',
  'gcl': 'git clone',
  'gini': 'git init',
};
```

- [ ] **Step 2: 添加别名展开函数**

在 `isCompareCommand` 函数之后添加：

```typescript
// 展开命令别名
const expandAlias = (cmd: string): string => {
  const trimmed = cmd.trim();
  if (!trimmed) return cmd;

  // 检查是否匹配别名（支持带参数的情况）
  // 例如 "gc" -> "git commit", "gc -m" -> "git commit -m"
  const words = trimmed.split(/\s+/);
  const firstWord = words[0].toLowerCase();

  if (GIT_ALIASES[firstWord]) {
    const expanded = GIT_ALIASES[firstWord];
    if (words.length > 1) {
      return `${expanded} ${words.slice(1).join(' ')}`;
    }
    return expanded;
  }

  return cmd;
};
```

- [ ] **Step 3: 修改 processCommand 函数以展开别名**

找到现有的 `processCommand` 函数，将其修改为：

```typescript
const processCommand = (cmd: string): string => {
  let processed = cmd.trim();
  const lower = processed.toLowerCase();

  // 先展开别名
  processed = expandAlias(processed);
  const expandedLower = processed.toLowerCase();

  // 如果是 git diff 且没有参数且有选中文件，添加文件路径
  if ((expandedLower === 'git diff' || expandedLower === 'diff') && selectedFile) {
    processed = `git diff ${selectedFile.path}`;
  }

  return processed;
};
```

---

## Task 2: 添加历史记录状态和存储逻辑

**Files:**
- Modify: `src/renderer/components/CommandBar.tsx`

- [ ] **Step 1: 添加历史记录相关状态**

在现有状态定义区域（大约第55-58行附近）添加：

```typescript
const [commandHistory, setCommandHistory] = useState<string[]>([]);
const [completionCandidates, setCompletionCandidates] = useState<string[]>([]);
const [selectedCompletionIndex, setSelectedCompletionIndex] = useState(-1);
const [showCompletions, setShowCompletions] = useState(false);
```

- [ ] **Step 2: 添加从 localStorage 加载历史的 useEffect**

在现有的 useEffect 区域之后添加：

```typescript
// 从 localStorage 加载命令历史
useEffect(() => {
  try {
    const saved = localStorage.getItem('git-browser-command-history');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setCommandHistory(parsed.slice(0, 100)); // 最多保存100条
      }
    }
  } catch (e) {
    console.error('Failed to load command history:', e);
  }
}, []);
```

- [ ] **Step 3: 添加保存到历史的函数**

在 `expandAlias` 函数之后添加：

```typescript
// 保存命令到历史记录
const saveToHistory = (cmd: string) => {
  if (!cmd.trim()) return;

  setCommandHistory(prev => {
    // 去除重复，保持最新在前
    const filtered = prev.filter(c => c !== cmd);
    const updated = [cmd, ...filtered].slice(0, 100);

    try {
      localStorage.setItem('git-browser-command-history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save command history:', e);
    }

    return updated;
  });
};
```

---

## Task 3: 实现补全候选列表逻辑

**Files:**
- Modify: `src/renderer/components/CommandBar.tsx`

- [ ] **Step 1: 添加获取候选列表函数**

在 `saveToHistory` 函数之后添加：

```typescript
// 获取补全候选列表
const getCompletionCandidates = (input: string): string[] => {
  if (!input.trim()) return [];

  const lower = input.toLowerCase();
  const candidates: string[] = [];

  // 1. 匹配别名
  for (const [alias, fullCmd] of Object.entries(GIT_ALIASES)) {
    if (alias.startsWith(lower) && fullCmd !== input) {
      candidates.push(fullCmd);
    }
  }

  // 2. 匹配历史记录（更精确的匹配优先）
  const historyMatches = commandHistory.filter(cmd =>
    cmd.toLowerCase().startsWith(lower) && !candidates.includes(cmd)
  );

  // 将历史匹配放在前面（更精确）
  candidates.unshift(...historyMatches);

  return candidates.slice(0, 8); // 最多显示8个候选
};
```

---

## Task 4: 修改输入框处理补全 UI

**Files:**
- Modify: `src/renderer/components/CommandBar.tsx`

- [ ] **Step 1: 添加命令输入变化处理函数**

找到 `handleKeyDown` 函数（在第525行附近），在其后添加：

```typescript
// 处理命令输入变化
const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setCommand(value);

  if (value.trim()) {
    const candidates = getCompletionCandidates(value);
    setCompletionCandidates(candidates);
    setShowCompletions(candidates.length > 0);
    setSelectedCompletionIndex(-1);
  } else {
    setCompletionCandidates([]);
    setShowCompletions(false);
    setSelectedCompletionIndex(-1);
  }
};
```

- [ ] **Step 2: 添加采纳补全函数**

在同一位置添加：

```typescript
// 采纳当前选中的补全
const acceptCompletion = () => {
  if (selectedCompletionIndex >= 0 && selectedCompletionIndex < completionCandidates.length) {
    setCommand(completionCandidates[selectedCompletionIndex]);
  }
  setShowCompletions(false);
  setSelectedCompletionIndex(-1);
};
```

- [ ] **Step 3: 修改 handleKeyDown 处理方向键和 Tab**

将现有的 `handleKeyDown` 函数替换为：

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    executeCommand();
  } else if (showCompletions) {
    if (e.key === 'ArrowRight') {
      // 右方向键：采纳补全
      e.preventDefault();
      acceptCompletion();
    } else if (e.key === 'ArrowDown') {
      // 下方向键：选择下一个
      e.preventDefault();
      setSelectedCompletionIndex(prev =>
        prev < completionCandidates.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      // 上方向键：选择上一个
      e.preventDefault();
      setSelectedCompletionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Tab' && selectedCompletionIndex < 0) {
      // Tab 键：自动选择第一个候选（如果当前没有选中）
      e.preventDefault();
      if (completionCandidates.length > 0) {
        setSelectedCompletionIndex(0);
      }
    } else if (e.key === 'Escape') {
      // ESC：关闭补全
      setShowCompletions(false);
      setSelectedCompletionIndex(-1);
    }
  }
};
```

- [ ] **Step 4: 修改输入框 onChange**

找到输入框组件（大约第544-552行），修改 `onChange`：

```typescript
<input
  ref={inputRef}
  type="text"
  className="flex-1 px-3 py-2 text-sm border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800"
  placeholder="输入 Git 命令，按回车执行..."
  value={command}
  onChange={handleCommandChange}
  onKeyDown={handleKeyDown}
  disabled={loading}
/>
```

- [ ] **Step 5: 在输入框后添加补全下拉列表**

在输入框所在 `div` 之后添加补全列表 UI：

```typescript
{showCompletions && completionCandidates.length > 0 && (
  <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
    {completionCandidates.map((candidate, index) => (
      <div
        key={candidate}
        className={`px-3 py-2 cursor-pointer text-sm ${
          index === selectedCompletionIndex
            ? 'bg-blue-500 text-white'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
        }`}
        onClick={() => {
          setSelectedCompletionIndex(index);
          acceptCompletion();
        }}
        onMouseEnter={() => setSelectedCompletionIndex(index)}
      >
        <span className="text-gray-400 dark:text-gray-500 text-xs mr-2">{index + 1}</span>
        <code className={index === selectedCompletionIndex ? '' : 'text-gray-500 dark:text-gray-400'}>
          {candidate}
        </code>
      </div>
    ))}
  </div>
)}
```

- [ ] **Step 6: 给输入框的容器 div 添加 relative 定位**

找到包含输入框的 `div`（className="flex gap-2"），添加相对定位：

```typescript
<div className="relative flex gap-2">
```

---

## Task 5: 修改 executeCommand 保存历史

**Files:**
- Modify: `src/renderer/components/CommandBar.tsx`

- [ ] **Step 1: 在 executeCommand 中添加保存历史调用**

找到 `executeCommand` 函数，在 `setLoading(true)` 之前添加：

```typescript
const executeCommand = async () => {
  if (!command.trim() || loading) return;

  // 保存到历史
  saveToHistory(processedCommand);

  setLoading(true);
```

---

## Task 6: 验证构建通过

**Files:**
- 修改: `src/renderer/components/CommandBar.tsx`

- [ ] **Step 1: 运行构建验证**

```bash
npm run build
```

预期输出：无 TypeScript 错误，Vite 构建成功

---

## 验证清单

- [ ] 输入 `ga` 时显示 `git add` 候选
- [ ] 输入 `glo` 时显示 `git log --oneline` 候选
- [ ] 下方向键可选中候选
- [ ] 右方向键采纳当前候选并填入输入框
- [ ] 执行命令后自动保存到历史
- [ ] 下次输入时可匹配历史记录
- [ ] 无匹配时补全列表不显示
- [ ] ESC 键关闭补全列表
- [ ] 构建无错误
