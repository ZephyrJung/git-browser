import React, { useState, useEffect } from 'react';

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
  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    const checkPlatform = async () => {
      const platform = await window.electron.getPlatform();
      setIsWindows(platform === 'win32');
    };
    checkPlatform();
  }, []);

  const handleMinimize = () => {
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.invoke('minimize-window');
  };

  const handleClose = () => {
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.invoke('close-window');
  };

  return (
    <div className={`flex items-center h-10 ${isWindows ? 'pl-14 pr-0' : 'px-4'} bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 ${isWindows ? 'drag-region' : ''}`}>
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
        className={`flex items-center justify-center w-8 h-8 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${isWindows ? 'no-drag-region' : ''}`}
        onClick={onSettingsClick}
        title="设置"
      >
        <span className="text-base">☰</span>
      </button>
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
