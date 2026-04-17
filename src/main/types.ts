import type { AppSettings } from '../shared/types';

export interface StoreData {
  settings: AppSettings;
  recentRepos: string[];
}
