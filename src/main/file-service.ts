// 文件系统服务
// 后续实现具体功能

import fs from 'fs';
import type { FileNode } from '@/shared/types';

export class FileService {
  async listFiles(_dirPath: string, _showHidden: boolean): Promise<FileNode[]> {
    // TODO: 实现
    return [];
  }

  async readFile(filePath: string): Promise<string> {
    return fs.readFileSync(filePath, 'utf-8');
  }
}

export const fileService = new FileService();
