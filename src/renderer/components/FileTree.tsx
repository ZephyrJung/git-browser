import React, { useState } from 'react';
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
            {node.children!.map((child: FileNode) => renderNode(child, depth + 1))}
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
        {mockRoot.children?.map((child: FileNode) => renderNode(child))}
      </div>
    </div>
  );
};

export default FileTree;
