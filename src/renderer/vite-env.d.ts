interface ElectronAPI {
  getSettings: () => Promise<any>;
  saveSettings: (settings: any) => Promise<boolean>;
  readFile: (path: string) => Promise<string>;
  getGitStatus: (repoPath: string) => Promise<any>;
  executeGitCommand: (repoPath: string, command: string) => Promise<any>;
}

declare interface Window {
  electron: ElectronAPI;
}
