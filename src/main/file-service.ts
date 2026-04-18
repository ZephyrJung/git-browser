// 文件系统服务

import fs from 'fs';
import path from 'path';
import type { FileNode } from '@/shared/types';

export class FileService {
  async listFiles(dirPath: string, showHidden: boolean): Promise<FileNode[]> {
    return this.readDirectory(dirPath, '', showHidden);
  }

  private readDirectory(dirPath: string, relativePath: string, showHidden: boolean): FileNode[] {
    const files = fs.readdirSync(dirPath);
    const result: FileNode[] = [];

    for (const file of files) {
      // 跳过 node_modules 和 .git
      if (file === 'node_modules' || file === '.git' || (file === '.gitignore' && !showHidden)) {
        continue;
      }

      // 跳过隐藏文件如果不显示
      if (!showHidden && file.startsWith('.')) {
        continue;
      }

      const fullPath = path.join(dirPath, file);
      const stats = fs.statSync(fullPath);
      let nodeRelativePath = relativePath ? path.join(relativePath, file) : file;

      // Always normalize to forward slash because git output uses forward slash
      // regardless of OS, so matching works correctly on all platforms
      nodeRelativePath = nodeRelativePath.replace(/\\/g, '/');

      if (stats.isDirectory()) {
        const children = this.readDirectory(fullPath, nodeRelativePath, showHidden);
        result.push({
          name: file,
          path: nodeRelativePath,
          isDirectory: true,
          status: 'normal',
          children,
        });
      } else {
        result.push({
          name: file,
          path: nodeRelativePath,
          isDirectory: false,
          status: 'normal',
        });
      }
    }

    // 排序：目录在前，文件在后，按名称排序
    result.sort((a, b) => {
      if (a.isDirectory === b.isDirectory) {
        return a.name.localeCompare(b.name);
      }
      return a.isDirectory ? -1 : 1;
    });

    return result;
  }

  async readFile(filePath: string): Promise<string> {
    return fs.readFileSync(filePath, 'utf-8');
  }
}

export const fileService = new FileService();
