import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FileNode, WorkMode, GitStatus } from '@/shared/types';
import TitleBar from './components/TitleBar';
import FileTree from './components/FileTree';
import CodeViewer from './components/CodeViewer';
import CommandBar from './components/CommandBar';
import ButtonBar from './components/ButtonBar';
import SettingsDialog from './components/SettingsDialog';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [workMode, setWorkMode] = useState<WorkMode>('command');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gitStatus] = useState<GitStatus>({
    branch: 'main',
    hasUncommittedChanges: false,
    files: {},
  });
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const isDragging = useRef(false);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await window.electron.getSettings();
      setWorkMode(settings.defaultMode);
    };
    loadSettings();
  }, []);

  const startDrag = () => {
    isDragging.current = true;
  };

  const onDrag = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) {
      const newWidth = Math.max(200, Math.min(window.innerWidth / 2, e.clientX));
      setSidebarWidth(newWidth);
    }
  }, []);

  // Global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDragging.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
  };

  const handleToggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  return (
    <div
      className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
      onMouseMove={onDrag}
    >
      <TitleBar
        branch={gitStatus.branch}
        hasChanges={gitStatus.hasUncommittedChanges}
        onSettingsClick={handleToggleSettings}
      />
      <div className="flex flex-1 overflow-hidden">
        <div style={{ width: sidebarWidth }} className="flex-shrink-0">
          <FileTree
            onFileSelect={handleFileSelect}
            gitStatus={gitStatus}
          />
        </div>
        <div
          className="w-1 bg-gray-300 dark:bg-gray-700 hover:bg-blue-500 cursor-col-resize flex-shrink-0"
          onMouseDown={startDrag}
        />
        <CodeViewer
          file={selectedFile}
          currentBranch={gitStatus.branch}
        />
      </div>
      {workMode === 'command' ? (
        <CommandBar />
      ) : (
        <ButtonBar />
      )}
      {settingsOpen && (
        <SettingsDialog onClose={handleToggleSettings} />
      )}
    </div>
  );
};

export default App;
