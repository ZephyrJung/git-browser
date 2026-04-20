import { app, BrowserWindow, ipcMain, screen } from 'electron'
import path from 'node:path'
import { storageService } from './storage-service'
import { gitService } from './git-service'
import { fileService } from './file-service'
import type { CommandResult } from '@/shared/types'

let mainWindow: BrowserWindow | null
const currentRepoPath = process.cwd();

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

ipcMain.handle('execute-git-command', async (_event, _repoPath, command): Promise<CommandResult> => {
  // TODO: 实现命令执行
  return {
    success: true,
    output: `Command received: ${command}`,
  }
})

ipcMain.handle('get-file-diff', async (_event, repoPath, filePath) => {
  return gitService.getFileDiff(repoPath, filePath);
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
