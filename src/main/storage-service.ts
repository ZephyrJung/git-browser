import fs from 'fs';
import path from 'path';
import os from 'os';
import type { AppSettings } from '@/shared/types';
import type { StoreData } from './types';

const defaultSettings: AppSettings = {
  showHiddenFiles: true,
  showLineNumbers: true,
  theme: 'light',
  defaultMode: 'command',
  requireConfirmation: true,
  credentials: {
    sshKeys: [],
    httpCredentials: [],
  },
};

const defaultStore: StoreData = {
  settings: defaultSettings,
  recentRepos: [],
};

export class StorageService {
  private storePath: string;
  private data: StoreData;

  constructor() {
    const configDir = path.join(os.homedir(), '.config', 'git-browser');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    this.storePath = path.join(configDir, 'config.json');
    this.data = this.load();
  }

  private load(): StoreData {
    try {
      if (!fs.existsSync(this.storePath)) {
        return defaultStore;
      }
      const content = fs.readFileSync(this.storePath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to load config, using default:', e);
      return defaultStore;
    }
  }

  private save(): void {
    try {
      fs.writeFileSync(this.storePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  }

  getSettings(): AppSettings {
    return this.data.settings;
  }

  setSettings(settings: AppSettings): void {
    this.data.settings = settings;
    this.save();
  }

  getRecentRepos(): string[] {
    return this.data.recentRepos;
  }

  addRecentRepo(repoPath: string): void {
    this.data.recentRepos = this.data.recentRepos.filter(r => r !== repoPath);
    this.data.recentRepos.unshift(repoPath);
    this.data.recentRepos = this.data.recentRepos.slice(0, 10);
    this.save();
  }
}

export const storageService = new StorageService();
