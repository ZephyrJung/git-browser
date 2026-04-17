import React, { useEffect, useState } from 'react';
import type { FileNode } from '@/shared/types';
import { highlight } from '../utils/syntaxHighlight';

interface CodeViewerProps {
  file: FileNode | null;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ file }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!file) {
      setContent('');
      return;
    }
    // TODO: 实际从主进程读取文件
    setContent(`// ${file.path}\n// 内容将从文件系统读取\n\nfunction example() {\n  return 42;\n}`);
  }, [file]);

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
        选择一个文件查看内容
      </div>
    );
  }

  const highlighted = highlight(content, file.path);

  return (
    <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 p-4">
      <pre className="text-sm">
        <code
          className="prism-code"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
};

export default CodeViewer;
