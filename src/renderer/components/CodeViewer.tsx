import React, { useEffect, useState } from 'react';
import type { FileNode } from '@/shared/types';
import type { LineInfo } from '@/shared/types';
import { highlight } from '../utils/syntaxHighlight';

interface CodeViewerProps {
  file: FileNode | null;
  currentBranch: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ file, currentBranch }) => {
  const [lines, setLines] = useState<LineInfo[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const [recentFiles] = useState<string[]>([]); // TODO: 从状态管理获取

  useEffect(() => {
    const loadContent = async () => {
      if (!file) {
        setLines([]);
        return;
      }
      const cwd = await window.electron.getCurrentRepoPath();

      // Always get diff info now - if file is unchanged it will just return all unchanged
      const diffLines = await window.electron.getFileDiff(cwd, file.path);
      setLines(diffLines);
    };
    loadContent();
  }, [file]);

  const toggleRecent = () => {
    setShowRecent(!showRecent);
  };

  const getLineBgClass = (type: LineInfo['type']): string => {
    switch (type) {
      case 'added':
        return 'bg-green-50 dark:bg-green-900/30';
      case 'removed':
        return 'bg-red-50 dark:bg-red-900/30';
      default:
        return '';
    }
  };

  if (!file) {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        <div className="flex items-center h-10 px-4 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {currentBranch && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {currentBranch}
            </span>
          )}
          <span className="ml-2 text-sm text-gray-400 dark:text-gray-500">
            未选择文件
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
          选择一个文件查看内容
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      <div className="relative flex items-center h-10 px-4 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {currentBranch && (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {currentBranch}
          </span>
        )}
        <button
          className="ml-2 flex-1 text-left text-sm text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 truncate"
          onClick={toggleRecent}
        >
          {file.path}
        </button>
        <span className="ml-1 text-gray-400">
          {showRecent ? '▲' : '▼'}
        </span>
        {showRecent && recentFiles.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg max-h-60 overflow-y-auto z-10">
            {recentFiles.map((path, index) => (
              <div
                key={index}
                className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                // TODO: 点击打开文件
              >
                {path}
              </div>
            ))}
          </div>
        )}
        {showRecent && recentFiles.length === 0 && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg z-10">
            <div className="px-4 py-2 text-sm text-gray-500">
              暂无最近文件
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-sm">
          <code className="prism-code">
            {lines.map((line, index) => (
              <div key={index} className={`block ${getLineBgClass(line.type)}`}>
                <span className="inline-block w-8 text-right pr-2 text-gray-400 select-none">
                  {index + 1}
                </span>
                <span dangerouslySetInnerHTML={{
                  __html: line.content === '' ? '&nbsp;' : highlight(line.content, file.path)
                }} />
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default CodeViewer;
