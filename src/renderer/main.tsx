import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Expose electron API to window - electron is available globally due to nodeIntegration: true
const { ipcRenderer } = window.require('electron')

declare global {
  interface Window {
    electron: {
      getSettings: () => Promise<any>;
      saveSettings: (settings: any) => Promise<boolean>;
      readFile: (filePath: string) => Promise<string>;
      listFiles: (dirPath: string, showHidden: boolean) => Promise<any[]>;
      getGitStatus: (repoPath: string) => Promise<any>;
      getFileDiff: (repoPath: string, filePath: string) => Promise<any>;
      executeGitCommand: (repoPath: string, command: string) => Promise<any>;
      getCurrentRepoPath: () => Promise<string>;
      getPlatform: () => Promise<string>;
      minimizeWindow: () => void;
      closeWindow: () => void;
    };
  }
}

window.electron = {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  listFiles: (dirPath: string, showHidden: boolean) => ipcRenderer.invoke('list-files', dirPath, showHidden),
  getGitStatus: (repoPath: string) => ipcRenderer.invoke('get-git-status', repoPath),
  getFileDiff: (repoPath: string, filePath: string) => ipcRenderer.invoke('get-file-diff', repoPath, filePath),
  executeGitCommand: (repoPath: string, command: string) => ipcRenderer.invoke('execute-git-command', repoPath, command),
  getCurrentRepoPath: () => ipcRenderer.invoke('get-current-repo-path'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
