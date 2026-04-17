import React, { useState, useEffect } from 'react';
import type { FileNode, GitStatus } from '@/shared/types';
import { getStatusColorClass } from '../utils/statusColors';

interface FileTreeProps {
  onFileSelect: (file: FileNode) => void;
  gitStatus: GitStatus;
  showHidden: boolean;
  repoPath: string;
}

type TabType = 'all' | 'staged' | 'favorites';

const FileTree: React.FC<FileTreeProps> = ({ onFileSelect, gitStatus, showHidden, repoPath }) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['/']));
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [rootFiles, setRootFiles] = useState<FileNode[]>([]);

  useEffect(() => {
    const loadFiles = async () => {
      if (!repoPath) return;
      const fullPath = repoPath;
      const files = await window.electron.listFiles(fullPath, showHidden);
      setRootFiles(files);
    };
    loadFiles();
  }, [showHidden, repoPath]);

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
            {node.children!.map((child: FileNode) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center p-1">
          <div className="flex flex-1">
            <button
              className={`flex-1 px-2 py-1 text-sm rounded ${
                activeTab === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab('all')}
            >
              文件
            </button>
            <button
              className={`flex-1 px-2 py-1 text-sm rounded ${
                activeTab === 'staged'
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab('staged')}
            >
              暂存区
            </button>
            <button
              className={`flex-1 px-2 py-1 text-sm rounded ${
                activeTab === 'favorites'
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab('favorites')}
            >
              收藏
            </button>
          </div>
          <button
            className="px-2 py-1 ml-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
            onClick={() => setShowSearch(!showSearch)}
            title="搜索"
          >
            🔍
          </button>
        </div>
        {showSearch && (
          <div className="p-2 border-t border-gray-300 dark:border-gray-700">
            <input
              type="text"
              placeholder="搜索文件..."
              className="w-full px-2 py-1 text-sm border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:ring-1 focus:ring-blue-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {rootFiles.map((child: FileNode) => renderNode(child))}
      </div>
    </div>
  );
};

export default FileTree;
