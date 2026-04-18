import React, { useState, useEffect, useCallback } from 'react';
import type { FileNode, GitStatus } from '@/shared/types';
import { getStatusColorClass } from '../utils/statusColors';

type TabType = 'all' | 'staged' | 'favorites';

interface FileTreeProps {
  onFileSelect: (file: FileNode) => void;
  gitStatus: GitStatus;
  showHidden: boolean;
  repoPath: string;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const FAVORITES_KEY = 'git-browser-favorites';

const FileTree: React.FC<FileTreeProps> = ({
  onFileSelect,
  gitStatus,
  showHidden,
  repoPath,
  activeTab,
  onTabChange,
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['/']));
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [rootFiles, setRootFiles] = useState<FileNode[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (saved) {
      try {
        setFavorites(new Set(JSON.parse(saved)));
      } catch (e) {
        setFavorites(new Set());
      }
    }
  }, []);

  // Save favorites to localStorage when changed
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  // Reload files whenever tab changes or showHidden/repoPath changes
  // to ensure we always get the latest file list
  useEffect(() => {
    const loadFiles = async () => {
      if (!repoPath) return;
      const fullPath = repoPath;
      const files = await window.electron.listFiles(fullPath, showHidden);
      setRootFiles(files);
    };
    loadFiles();
  }, [showHidden, repoPath, activeTab]);

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

  const toggleFavorite = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(path)) {
      newFavorites.delete(path);
    } else {
      newFavorites.add(path);
    }
    setFavorites(newFavorites);
  };

  const getFileStatus = (path: string): FileNode['status'] => {
    return gitStatus.files[path] || 'normal';
  };

  // Filter nodes based on active tab and search
  // Re-calculated on every render because gitStatus and activeTab change very frequently
  const shouldRenderNode = (node: FileNode): boolean => {
    // Search filter
    if (search && !node.name.toLowerCase().includes(search.toLowerCase())) {
      // If node doesn't match but has children that match, still render
      if (!node.children || !hasMatchingChild(node, search)) {
        return false;
      }
    }

    // Tab filter
    switch (activeTab) {
      case 'staged':
        // Only show files that have git changes (in gitStatus.files)
        if (node.isDirectory) {
          // Show directory if it contains changed files
          return hasChangedFile(node);
        }
        return gitStatus.files[node.path] !== undefined;
      case 'favorites':
        if (node.isDirectory) {
          // Show directory if it contains favorited files
          return hasFavoriteFile(node);
        }
        return favorites.has(node.path);
      default:
        return true;
    }
  };

  // Check if any descendant matches search
  function hasMatchingChild(node: FileNode, search: string): boolean {
    if (!node.children) return false;
    for (const child of node.children) {
      if (child.name.toLowerCase().includes(search.toLowerCase())) {
        return true;
      }
      if (child.isDirectory && hasMatchingChild(child, search)) {
        return true;
      }
    }
    return false;
  }

  // Check if directory contains any changed files
  function hasChangedFile(node: FileNode): boolean {
    if (!node.children) return false;
    for (const child of node.children) {
      if (!child.isDirectory && gitStatus.files[child.path] !== undefined) {
        return true;
      }
      if (child.isDirectory && hasChangedFile(child)) {
        return true;
      }
    }
    return false;
  }

  // Check if directory contains any favorited files
  function hasFavoriteFile(node: FileNode): boolean {
    if (!node.children) return false;
    for (const child of node.children) {
      if (!child.isDirectory && favorites.has(child.path)) {
        return true;
      }
      if (child.isDirectory && hasFavoriteFile(child)) {
        return true;
      }
    }
    return false;
  }

  const renderNode = (node: FileNode, depth: number = 0) => {
    if (!shouldRenderNode(node)) {
      return null;
    }

    const status = getFileStatus(node.path);
    const isExpanded = expandedPaths.has(node.path);
    const hasVisibleChildren = node.children && node.children.some(child => shouldRenderNode(child));
    const isFavorite = favorites.has(node.path);
    const showFavorite = activeTab === 'all'; // Only show favorite star in "all files" tab

    return (
      <div key={node.path}>
        <div
          className={`flex items-center w-full px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${getStatusColorClass(
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
          onContextMenu={e => {
            if (!node.isDirectory && showFavorite) {
              toggleFavorite(e, node.path);
            }
          }}
          title={!node.isDirectory && showFavorite ? (isFavorite ? '右键取消收藏' : '右键添加收藏') : ''}
        >
          {node.isDirectory && (
            <span className="mr-1 text-xs flex-shrink-0">
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          {!node.isDirectory && <span className="mr-1 w-3 flex-shrink-0"></span>}
          <span className="text-sm flex-1 min-w-0">{node.name}</span>
          {!node.isDirectory && showFavorite && (
            <span className="ml-1 w-4 flex-shrink-0 text-center cursor-pointer" onClick={e => toggleFavorite(e, node.path)} title={isFavorite ? '取消收藏' : '添加收藏'}>
              {isFavorite ? '⭐' : '☆'}
            </span>
          )}
          {!node.isDirectory && !showFavorite && (
            <span className="ml-1 w-4 flex-shrink-0"></span>
          )}
        </div>
        {node.isDirectory && isExpanded && hasVisibleChildren && (
          <div>
            {node.children!.map((child: FileNode) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderRootNodes = () => {
    return rootFiles.map((child: FileNode) => renderNode(child)).filter(Boolean);
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
              onClick={() => onTabChange('all')}
            >
              文件
            </button>
            <button
              className={`flex-1 px-2 py-1 text-sm rounded ${
                activeTab === 'staged'
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
              onClick={() => onTabChange('staged')}
            >
              暂存区
              {gitStatus.hasUncommittedChanges && (
                <span className="ml-1 text-xs">({Object.keys(gitStatus.files).length})</span>
              )}
            </button>
            <button
              className={`flex-1 px-2 py-1 text-sm rounded ${
                activeTab === 'favorites'
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
              onClick={() => onTabChange('favorites')}
            >
              收藏
              {favorites.size > 0 && (
                <span className="ml-1 text-xs">({favorites.size})</span>
              )}
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
        <div key={`${activeTab}-${Object.keys(gitStatus.files).length}`}>
          {renderRootNodes()}
        </div>
        {activeTab === 'staged' && Object.keys(gitStatus.files).length === 0 && (
          <div className="p-4 text-sm text-gray-500 text-center">暂无变更文件</div>
        )}
        {activeTab === 'favorites' && favorites.size === 0 && (
          <div className="p-4 text-sm text-gray-500 text-center">
            暂无收藏文件<br />
            <span className="text-xs">右键点击文件可添加收藏</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileTree;
