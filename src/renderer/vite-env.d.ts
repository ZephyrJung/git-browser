interface ElectronAPI {
  getSettings: () => Promise<any>;
  saveSettings: (settings: any) => Promise<boolean>;
  readFile: (path: string) => Promise<string>;
  listFiles: (dirPath: string, showHidden: boolean) => Promise<any>;
  getGitStatus: (repoPath: string) => Promise<any>;
  getFileDiff: (repoPath: string, filePath: string) => Promise<any>;
  executeGitCommand: (repoPath: string, command: string) => Promise<any>;
  getCurrentRepoPath: () => Promise<string>;
  getPlatform: () => Promise<string>;
  minimizeWindow: () => void;
  closeWindow: () => void;
}

declare interface Window {
  electron: ElectronAPI;
}
