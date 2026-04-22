interface ElectronAPI {
  getSettings: () => Promise<any>;
  saveSettings: (settings: any) => Promise<boolean>;
  readFile: (path: string) => Promise<string>;
  listFiles: (dirPath: string, showHidden: boolean) => Promise<any>;
  getGitStatus: (repoPath: string) => Promise<any>;
  getFileDiff: (repoPath: string, filePath: string) => Promise<any>;
  getGitUserInfo: (repoPath: string) => Promise<{ name: string; email: string }>;
  executeGitCommand: (repoPath: string, command: string) => Promise<any>;
  getCurrentRepoPath: () => Promise<string>;
  setCurrentRepoPath: (path: string) => Promise<void>;
  getPlatform: () => Promise<string>;
  getRecentFiles: () => Promise<string[]>;
  addRecentFile: (filePath: string, maxCount: number) => Promise<boolean>;
  selectFolder: () => Promise<string>;
  minimizeWindow: () => void;
  closeWindow: () => void;
}

declare interface Window {
  electron: ElectronAPI;
}
