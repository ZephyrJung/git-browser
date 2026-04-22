export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  status: 'new' | 'modified' | 'deleted' | 'conflict' | 'normal';
  children?: FileNode[];
  expanded?: boolean;
}

export type WorkMode = 'command' | 'button';

export interface AppSettings {
  showHiddenFiles: boolean;
  showLineNumbers: boolean;
  theme: 'light' | 'dark';
  defaultMode: WorkMode;
  requireConfirmation: boolean;
  maxRecentFiles: number;
  credentials: {
    sshKeys: SshKey[];
    httpCredentials: HttpCredential[];
  };
}

export interface SshKey {
  id: string;
  name: string;
  path: string;
  isDefault: boolean;
}

export interface HttpCredential {
  id: string;
  url: string;
  username: string;
}

export interface GitFileStatus {
  status: FileNode['status'];
  staged: boolean;
}

export interface GitStatus {
  branch: string;
  hasUncommittedChanges: boolean;
  files: { [path: string]: GitFileStatus };
}

export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
}

export interface LineInfo {
  content: string;
  type: 'unchanged' | 'added' | 'removed';
}
