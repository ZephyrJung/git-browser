import React, { useState, useEffect, useRef } from 'react';

interface TitleBarProps {
  branch: string;
  hasChanges: boolean;
  repoPath: string;
  onRepoChange: (newPath: string) => void;
  onSettingsClick: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({
  branch,
  hasChanges,
  repoPath,
  onRepoChange,
  onSettingsClick,
}) => {
  const [isWindows, setIsWindows] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleOpenRepo = async () => {
    const selectedPath = await window.electron.selectFolder();
    if (selectedPath) {
      onRepoChange(selectedPath);
    }
  };

  useEffect(() => {
    const checkPlatform = async () => {
      const platform = await window.electron.getPlatform();
      setIsWindows(platform === 'win32');
    };
    checkPlatform();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleMinimize = () => {
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.invoke('minimize-window');
  };

  const handleClose = () => {
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.invoke('close-window');
  };

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  const handleSettingsSelect = () => {
    setShowMenu(false);
    onSettingsClick();
  };

  return (
    <div className={`flex items-center h-10 ${isWindows ? 'pl-14 pr-0' : 'px-4'} bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 ${isWindows ? 'drag-region' : ''}`}>
      <div className="flex-1 px-4 text-left text-sm font-medium">
        <span
          className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 underline-offset-2 hover:underline"
          onClick={handleOpenRepo}
          title="点击选择其他仓库"
        >
          {repoPath || 'git-browser'}
        </span>
        {branch && (
          <span className="ml-2 text-gray-500 dark:text-gray-400">
            [{branch}]
          </span>
        )}
      </div>
      {hasChanges && (
        <span className="w-3 h-3 mr-2 bg-yellow-500 rounded-full animate-pulse" title="有未提交变更" />
      )}
      <div className="relative" ref={menuRef}>
        <button
          className={`flex items-center justify-center w-8 h-8 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${isWindows ? 'no-drag-region' : ''}`}
          onClick={handleMenuClick}
          title="菜单"
        >
          <span className="text-base">☰</span>
        </button>
        {showMenu && (
          <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded py-1 z-50 no-drag-region">
            <div
              className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              onClick={handleSettingsSelect}
            >
              ⚙ 设置
            </div>
          </div>
        )}
      </div>
      {isWindows && (
        <>
          <button
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-200 dark:hover:bg-gray-700 no-drag-region"
            onClick={handleMinimize}
            title="最小化"
          >
            <span className="text-base">−</span>
          </button>
          <button
            className="flex items-center justify-center w-10 h-10 hover:bg-red-500 hover:text-white no-drag-region"
            onClick={handleClose}
            title="关闭"
          >
            <span className="text-base">×</span>
          </button>
        </>
      )}
    </div>
  );
};

export default TitleBar;
