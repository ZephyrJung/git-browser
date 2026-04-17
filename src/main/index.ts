import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { storageService } from './storage-service'
import { gitService } from './git-service'
import { fileService } from './file-service'
import type { CommandResult } from '@/shared/types'

let mainWindow: BrowserWindow | null
const currentRepoPath = process.cwd();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hidden',
    frame: false,
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

ipcMain.handle('get-current-repo-path', () => {
  return currentRepoPath;
})
