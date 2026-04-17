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

export interface GitStatus {
  branch: string;
  hasUncommittedChanges: boolean;
  files: { [path: string]: FileNode['status'] };
}

export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
}
