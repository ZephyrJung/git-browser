"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const electron = require("electron");
const path$1 = require("node:path");
const fs = require("fs");
const path = require("path");
const os = require("os");
const defaultSettings = {
  showHiddenFiles: true,
  showLineNumbers: true,
  theme: "light",
  defaultMode: "command",
  requireConfirmation: true,
  credentials: {
    sshKeys: [],
    httpCredentials: []
  }
};
const defaultStore = {
  settings: defaultSettings,
  recentRepos: []
};
class StorageService {
  constructor() {
    __publicField(this, "storePath");
    __publicField(this, "data");
    const configDir = path.join(os.homedir(), ".config", "git-browser");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    this.storePath = path.join(configDir, "config.json");
    this.data = this.load();
  }
  load() {
    try {
      if (!fs.existsSync(this.storePath)) {
        return defaultStore;
      }
      const content = fs.readFileSync(this.storePath, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Failed to load config, using default:", e);
      return defaultStore;
    }
  }
  save() {
    try {
      fs.writeFileSync(this.storePath, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save config:", e);
    }
  }
  getSettings() {
    return this.data.settings;
  }
  setSettings(settings) {
    this.data.settings = settings;
    this.save();
  }
  getRecentRepos() {
    return this.data.recentRepos;
  }
  addRecentRepo(repoPath) {
    this.data.recentRepos = this.data.recentRepos.filter((r) => r !== repoPath);
    this.data.recentRepos.unshift(repoPath);
    this.data.recentRepos = this.data.recentRepos.slice(0, 10);
    this.save();
  }
}
const storageService = new StorageService();
class GitService {
  async getStatus(_repoPath) {
    return {
      branch: "main",
      hasUncommittedChanges: false,
      files: {}
    };
  }
}
const gitService = new GitService();
class FileService {
  async listFiles(_dirPath, _showHidden) {
    return [];
  }
  async readFile(filePath) {
    const fs2 = require("fs");
    return fs2.readFileSync(filePath, "utf-8");
  }
}
const fileService = new FileService();
let mainWindow;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: "hidden",
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path$1.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
electron.app.whenReady().then(createWindow);
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
electron.ipcMain.handle("get-settings", () => {
  return storageService.getSettings();
});
electron.ipcMain.handle("save-settings", (_event, settings) => {
  storageService.setSettings(settings);
  return true;
});
electron.ipcMain.handle("read-file", async (_event, filePath) => {
  return fileService.readFile(filePath);
});
electron.ipcMain.handle("list-files", async (_event, dirPath, showHidden) => {
  return fileService.listFiles(dirPath, showHidden);
});
electron.ipcMain.handle("get-git-status", async (_event, repoPath) => {
  return gitService.getStatus(repoPath);
});
electron.ipcMain.handle("execute-git-command", async (_event, _repoPath, command) => {
  return {
    success: true,
    output: `Command received: ${command}`
  };
});
