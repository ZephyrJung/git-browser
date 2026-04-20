import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { FileNode } from '@/shared/types';
import type { LineInfo } from '@/shared/types';
import { highlight } from '../utils/syntaxHighlight';

interface CodeViewerProps {
  file: FileNode | null;
  currentBranch: string;
  repoPath: string;
  recentFiles: string[];
  onRecentFileSelect: (filePath: string) => void;
}

const CodeViewer: React.FC<CodeViewerProps> = ({
  file,
  currentBranch,
  repoPath,
  recentFiles,
  onRecentFileSelect
}) => {
  const [lines, setLines] = useState<LineInfo[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRecent(false);
      }
    };
    if (showRecent) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRecent]);

  const toggleRecent = () => {
    setShowRecent(!showRecent);
  };

  const handleRecentClick = useCallback((path: string) => {
    onRecentFileSelect(path);
    setShowRecent(false);
  }, [onRecentFileSelect]);

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

  const getMarkBgClass = (type: LineInfo['type']): string => {
    switch (type) {
      case 'added':
        return 'bg-green-600 dark:bg-green-500';
      case 'removed':
        return 'bg-red-600 dark:bg-red-500';
      default:
        return '';
    }
  };

  // Get changed lines for the skeleton bar
  const changedLineMarks = lines
    .map((line, index) => ({ lineIndex: index, type: line.type }))
    .filter(item => item.type !== 'unchanged');

  const handleJumpToLine = (lineIndex: number) => {
    if (!scrollContainerRef.current) return;

    // Find the element for this line and scroll it into view
    const lineElements = scrollContainerRef.current.querySelectorAll('[data-line-index]');
    const targetElement = lineElements[lineIndex] as HTMLElement;
    if (targetElement) {
      targetElement.scrollIntoView({ block: 'center', behavior: 'smooth' });
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
          {(() => {
            const fullPath = repoPath ? `${repoPath}/${file.path}` : file.path;
            const lastSlashIndex = fullPath.lastIndexOf('/');
            if (lastSlashIndex !== -1) {
              return (
                <>
                  <span className="text-gray-400 dark:text-gray-500">
                    {fullPath.slice(0, lastSlashIndex + 1)}
                  </span>
                  <span className="font-semibold">
                    {fullPath.slice(lastSlashIndex + 1)}
                  </span>
                </>
              );
            }
            return <span className="font-semibold">{fullPath}</span>;
          })()}
        </button>
        <span className="ml-1 text-gray-400">
          {showRecent ? '▲' : '▼'}
        </span>
        {showRecent && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg max-h-60 overflow-y-auto z-10"
          >
            {recentFiles.length > 0 ? (
              recentFiles.map((path, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${path === file.path ? 'bg-blue-100 dark:bg-blue-900/50' : ''}`}
                  onClick={() => handleRecentClick(path)}
                >
                  {path}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                暂无最近文件
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-hidden relative">
        {/* Scrollable code content - add right padding to reserve space for skeleton bar */}
        {/* This ensures scrollbar appears before skeleton bar, not blocked */}
        {/* When code is wider than container, horizontal scrollbar shows on the bottom left of skeleton */}
        <div className="h-full overflow-auto p-4 pr-[14px]" ref={scrollContainerRef}>
          <pre className="text-sm">
            <code className="prism-code">
              {lines.map((line, index) => (
                <div key={index} data-line-index={index} className={`block ${getLineBgClass(line.type)}`}>
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
        {/* Change skeleton bar - ALWAYS sticks to the FAR RIGHT edge (window edge) */}
        {/* - position: absolute top-0 right-0 = pins to the top-right corner of CodeViewer */}
        {/* - CodeViewer already extends to the window right edge, so this pins to window right edge */}
        {/* - when you resize window or drag sidebar, it automatically moves and stays at right edge */}
        {/* - width is fixed 10px, always visible regardless container size */}
        {/* - high z-index ensures it's on TOP of everything including horizontal scrollbar */}
        <div className="absolute top-0 right-0 w-[10px] h-full bg-gray-200 dark:bg-gray-700 pointer-events-auto z-20">
          {changedLineMarks.map((mark, _index) => {
            const ratio = mark.lineIndex / lines.length;
            const top = ratio * 100;
            const bgClass = getMarkBgClass(mark.type);
            return (
              <div
                key={`${mark.lineIndex}-${_index}`}
                className={`absolute right-[1px] w-[8px] h-[8px] rounded-sm cursor-pointer ${bgClass} border border-white/50 hover:scale-150 hover:z-10 transition-transform`}
                style={{ top: `${top}%` }}
                title={`行 ${mark.lineIndex + 1}`}
                onClick={() => handleJumpToLine(mark.lineIndex)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;
