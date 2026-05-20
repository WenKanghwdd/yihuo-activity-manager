const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// ===== 数据文件管理 =====
const DATA_DIR = path.join(app.getPath('userData'), 'data');
const DATA_FILE = path.join(DATA_DIR, 'yuehuo-data.json');
const DATA_VERSION = 1;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ===== IPC 处理器 =====

// 保存全部数据
ipcMain.handle('data:save', async (_event, jsonData) => {
  try {
    ensureDataDir();
    const payload = {
      version: DATA_VERSION,
      savedAt: new Date().toISOString(),
      data: jsonData,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    return { ok: true };
  } catch (err) {
    console.error('保存数据失败:', err);
    return { ok: false, error: err.message };
  }
});

// 读取全部数据
ipcMain.handle('data:load', async () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { ok: true, data: null };
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const payload = JSON.parse(raw);
    return { ok: true, data: payload.data || null, savedAt: payload.savedAt || null };
  } catch (err) {
    console.error('读取数据失败:', err);
    return { ok: false, error: err.message, data: null };
  }
});

// 获取数据文件信息
ipcMain.handle('data:info', async () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { ok: true, exists: false, size: 0 };
    }
    const stat = fs.statSync(DATA_FILE);
    return {
      ok: true,
      exists: true,
      size: stat.size,
      modifiedAt: stat.mtime.toISOString(),
      dataDir: DATA_DIR,
    };
  } catch (err) {
    return { ok: false, error: err.message, exists: false, size: 0 };
  }
});

// 清空数据文件
ipcMain.handle('data:clear', async () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// 获取平台和环境信息
ipcMain.handle('app:info', async () => {
  return {
    platform: process.platform,
    version: app.getVersion(),
    userData: app.getPath('userData'),
    dataFile: DATA_FILE,
    isElectron: true,
  };
});

// ===== 窗口 =====

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: '悦活 - 养老院活动管理系统',
    icon: path.join(__dirname, '../public/logo.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
