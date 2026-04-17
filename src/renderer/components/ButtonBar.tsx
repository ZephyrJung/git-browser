import React from 'react';

interface ButtonBarProps {
  // TODO: 实现各个按钮的点击处理
}

const ButtonBar: React.FC<ButtonBarProps> = () => {
  const buttons = [
    { id: 'switch', label: '切换分支' },
    { id: 'pull', label: '拉取最新' },
    { id: 'push', label: '推送远程' },
    { id: 'diff', label: '分支比对' },
    { id: 'merge', label: '分支合并' },
  ];

  const handleClick = (id: string) => {
    console.log('Button clicked:', id);
    // TODO: 弹出对应操作对话框
  };

  return (
    <div className="border-t border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
      <div className="flex gap-2">
        {buttons.map(btn => (
          <button
            key={btn.id}
            className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onClick={() => handleClick(btn.id)}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ButtonBar;
