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
