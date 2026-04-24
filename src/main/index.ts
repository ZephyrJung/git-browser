import { app, BrowserWindow, ipcMain, screen, dialog } from 'electron'
import path from 'node:path'
import { spawn } from 'child_process'
import { storageService } from './storage-service'
import { gitService } from './git-service'
import { fileService } from './file-service'
import type { CommandResult } from '@/shared/types'

let mainWindow: BrowserWindow | null
let currentRepoPath = process.cwd();

function createWindow() {
  const isWindows = process.platform === 'win32';
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  const width = Math.round(screenWidth * 0.8);
  const height = Math.round(screenHeight * 0.85);

  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: isWindows ? 'hidden' : 'default',
    frame: !isWindows,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.NODE_ENV === 'development') {
    const url = 'http://localhost:5173'
    mainWindow.loadURL(url)
    mainWindow.webContents.openDevTools()
  } else {
    const indexPath = path.join(app.getAppPath(), 'dist/index.html')
    mainWindow.loadFile(indexPath)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC handlers
ipcMain.handle('get-settings', () => {
  return storageService.getSettings()
})

ipcMain.handle('save-settings', (_event, settings) => {
  storageService.setSettings(settings)
  return true
})

ipcMain.handle('read-file', async (_event, filePath) => {
  return fileService.readFile(filePath)
})

ipcMain.handle('list-files', async (_event, dirPath, showHidden) => {
  return fileService.listFiles(dirPath, showHidden)
})

ipcMain.handle('get-git-status', async (_event, repoPath) => {
  return gitService.getStatus(repoPath)
})

ipcMain.handle('execute-git-command', async (_event, repoPath, command): Promise<CommandResult> => {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    // Use spawn to capture both stdout and stderr (git push/fetch output to stderr)
    const child = spawn(isWindows ? 'cmd' : 'bash', [
      isWindows ? '/c' : '-c',
      command
    ], {
      cwd: repoPath,
    });

    let stdout = '';
    let stderr = '';
    let timeoutId: NodeJS.Timeout | null = null;

    // Set 5 minute timeout to prevent hanging on interactive commands
    timeoutId = setTimeout(() => {
      child.kill();
      resolve({
        success: false,
        output: '命令执行超时（5分钟）。可能需要输入凭证，请先在命令行配置好 Git 凭证缓存。',
        error: 'ETIMEDOUT',
      });
    }, 5 * 60 * 1000);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (timeoutId) clearTimeout(timeoutId);

      // Combine both stdout and stderr - git puts useful info in stderr
      const combinedOutput = (stdout + '\n' + stderr).trim();

      if (code === 0) {
        resolve({
          success: true,
          output: combinedOutput,
        });
      } else {
        resolve({
          success: false,
          output: combinedOutput || `进程退出码 ${code}`,
          error: `Exit code ${code}`,
        });
      }
    });

    child.on('error', (err) => {
      if (timeoutId) clearTimeout(timeoutId);
      resolve({
        success: false,
        output: err.message,
        error: String(err),
      });
    });
  });
})

ipcMain.handle('get-file-diff', async (_event, repoPath, filePath) => {
  return gitService.getFileDiff(repoPath, filePath);
})

ipcMain.handle('get-git-user-info', async (_event, repoPath) => {
  try {
    return await gitService.getGitUserInfo(repoPath);
  } catch (e) {
    console.error('Failed to get git user info:', e);
    return { name: '', email: '' };
  }
})

ipcMain.handle('get-current-repo-path', () => {
  return currentRepoPath;
})

ipcMain.handle('get-platform', () => {
  return process.platform;
})

ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
})

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
})

ipcMain.handle('get-recent-files', () => {
  return storageService.getRecentFiles()
})

ipcMain.handle('add-recent-file', (_event, filePath, maxCount) => {
  storageService.addRecentFile(filePath, maxCount)
  return true
})

ipcMain.handle('select-folder', async () => {
  if (!mainWindow) return '';
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: '选择 Git 仓库文件夹',
  });
  if (result.canceled || result.filePaths.length === 0) {
    return '';
  }
  return result.filePaths[0];
})

ipcMain.handle('set-current-repo-path', (_event, path) => {
  currentRepoPath = path;
})
