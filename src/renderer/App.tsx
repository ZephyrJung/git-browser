import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FileNode, WorkMode, AppSettings, GitStatus } from '@/shared/types';
import TitleBar from './components/TitleBar';
import FileTree from './components/FileTree';
import CodeViewer from './components/CodeViewer';
import CommandBar from './components/CommandBar';
import ButtonBar from './components/ButtonBar';
import SettingsDialog from './components/SettingsDialog';

type TabType = 'all' | 'staged' | 'favorites';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [workMode, setWorkMode] = useState<WorkMode>('command');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [gitStatus, setGitStatus] = useState<GitStatus>({
    branch: 'main',
    hasUncommittedChanges: false,
    files: {},
  });
  const [repoPath, setRepoPath] = useState<string>('');
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const isDragging = useRef(false);

  useEffect(() => {
    const getRepoPath = async () => {
      const path = await window.electron.getCurrentRepoPath();
      setRepoPath(path);
    };
    getRepoPath();
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      const loaded = await window.electron.getSettings();
      setSettings(loaded);
      setWorkMode(loaded.defaultMode);
    };
    loadSettings();
  }, []);

  // Refresh git status whenever repoPath changes or tab changes (always get latest)
  useEffect(() => {
    refreshGitStatus();
  }, [repoPath, activeTab]);

  const refreshGitStatus = async () => {
    if (!repoPath) return;
    const status = await window.electron.getGitStatus(repoPath);
    setGitStatus(status);
  };

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

  const handleCloseSettings = async () => {
    // Reload settings after dialog closed in case it was saved
    const loaded = await window.electron.getSettings();
    setSettings(loaded);
    setWorkMode(loaded.defaultMode);
    refreshGitStatus();
    setSettingsOpen(false);
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
            showHidden={settings?.showHiddenFiles ?? true}
            repoPath={repoPath}
            activeTab={activeTab}
            onTabChange={setActiveTab}
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
      {settingsOpen && settings && (
        <SettingsDialog onClose={handleCloseSettings} />
      )}
    </div>
  );
};

export default App;
