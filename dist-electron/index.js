var g = Object.defineProperty;
var m = (t, e, s) => e in t ? g(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s;
var o = (t, e, s) => m(t, typeof e != "symbol" ? e + "" : e, s);
import { app as a, BrowserWindow as d, ipcMain as r } from "electron";
import p from "node:path";
import i from "fs";
import c from "path";
import S from "os";
const v = {
  showHiddenFiles: !0,
  showLineNumbers: !0,
  theme: "light",
  defaultMode: "command",
  requireConfirmation: !0,
  credentials: {
    sshKeys: [],
    httpCredentials: []
  }
}, l = {
  settings: v,
  recentRepos: []
};
class w {
  constructor() {
    o(this, "storePath");
    o(this, "data");
    const e = c.join(S.homedir(), ".config", "git-browser");
    i.existsSync(e) || i.mkdirSync(e, { recursive: !0 }), this.storePath = c.join(e, "config.json"), this.data = this.load();
  }
  load() {
    try {
      if (!i.existsSync(this.storePath))
        return l;
      const e = i.readFileSync(this.storePath, "utf-8");
      return JSON.parse(e);
    } catch (e) {
      return console.error("Failed to load config, using default:", e), l;
    }
  }
  save() {
    try {
      i.writeFileSync(this.storePath, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save config:", e);
    }
  }
  getSettings() {
    return this.data.settings;
  }
  setSettings(e) {
    this.data.settings = e, this.save();
  }
  getRecentRepos() {
    return this.data.recentRepos;
  }
  addRecentRepo(e) {
    this.data.recentRepos = this.data.recentRepos.filter((s) => s !== e), this.data.recentRepos.unshift(e), this.data.recentRepos = this.data.recentRepos.slice(0, 10), this.save();
  }
}
const h = new w();
class y {
  async getStatus(e) {
    return {
      branch: "main",
      hasUncommittedChanges: !1,
      files: {}
    };
  }
}
const R = new y();
class F {
  async listFiles(e, s) {
    return [];
  }
  async readFile(e) {
    return i.readFileSync(e, "utf-8");
  }
}
const u = new F();
let n;
function f() {
  n = new d({
    width: 1200,
    height: 800,
    titleBarStyle: "hidden",
    frame: !1,
    webPreferences: {
      nodeIntegration: !0,
      contextIsolation: !1
    }
  }), process.env.NODE_ENV === "development" ? (n.loadURL("http://localhost:5173"), n.webContents.openDevTools()) : n.loadFile(p.join(__dirname, "../dist/index.html")), n.on("closed", () => {
    n = null;
  });
}
a.whenReady().then(f);
a.on("window-all-closed", () => {
  process.platform !== "darwin" && a.quit();
});
a.on("activate", () => {
  d.getAllWindows().length === 0 && f();
});
r.handle("get-settings", () => h.getSettings());
r.handle("save-settings", (t, e) => (h.setSettings(e), !0));
r.handle("read-file", async (t, e) => u.readFile(e));
r.handle("list-files", async (t, e, s) => u.listFiles(e, s));
r.handle("get-git-status", async (t, e) => R.getStatus(e));
r.handle("execute-git-command", async (t, e, s) => ({
  success: !0,
  output: `Command received: ${s}`
}));
