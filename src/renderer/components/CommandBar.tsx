import React, { useState } from 'react';
import type { CommandResult } from '@/shared/types';

interface CommandBarProps {
  // TODO: 连接到 main process
}

const CommandBar: React.FC<CommandBarProps> = () => {
  const [command, setCommand] = useState('');
  const [result, setResult] = useState<CommandResult | null>(null);

  const executeCommand = async () => {
    if (!command.trim()) return;
    // TODO: 调用主进程执行命令
    setResult({
      success: true,
      output: `Executed: ${command}`,
    });
    setCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand();
    }
  };

  return (
    <div className="border-t border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 px-3 py-2 text-sm border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="输入 Git 命令，按回车执行..."
          value={command}
          onChange={e => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onClick={executeCommand}
        >
          发送
        </button>
        {result && (
          <span
            className={`flex items-center px-3 py-2 rounded ${
              result.success
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {result.success ? '✓' : '✗'}
          </span>
        )}
      </div>
    </div>
  );
};

export default CommandBar;
