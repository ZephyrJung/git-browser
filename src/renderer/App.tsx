import React, { useState, useEffect } from 'react';
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
    branch: '',
    hasUncommittedChanges: false,
    files: {},
  });

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await window.electron.getSettings();
      setWorkMode(settings.defaultMode);
    };
    loadSettings();
  }, []);

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
  };

  const handleToggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <TitleBar
        branch={gitStatus.branch}
        hasChanges={gitStatus.hasUncommittedChanges}
        onSettingsClick={handleToggleSettings}
      />
      <div className="flex flex-1 overflow-hidden">
        <FileTree
          onFileSelect={handleFileSelect}
          gitStatus={gitStatus}
        />
        <CodeViewer
          file={selectedFile}
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
