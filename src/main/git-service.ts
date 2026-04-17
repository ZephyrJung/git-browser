// Git 操作服务
// 后续实现具体功能

import type { GitStatus } from '@/shared/types';

export class GitService {
  async getStatus(_repoPath: string): Promise<GitStatus> {
    // TODO: 实现
    return {
      branch: 'main',
      hasUncommittedChanges: false,
      files: {},
    };
  }
}

export const gitService = new GitService();
