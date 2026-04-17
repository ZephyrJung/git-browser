import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { storageService } from './storage-service'
import { gitService } from './git-service'
import { fileService } from './file-service'
import type { CommandResult } from '@/shared/types'

let mainWindow: BrowserWindow | null

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string
declare const MAIN_WINDOW_VITE_NAME: string

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hidden',
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
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
