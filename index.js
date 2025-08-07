//const { app, BrowserWindow } = require("electron");
import { app, BrowserWindow } from "electron";
//const Store = require("electron-store");
import Store from "electron-store";
const store = new Store();

function createWindow() {
  // 以前保存したウィンドウサイズを取得
  const windowBounds = store.get("windowBounds") || { width: 800, height: 600 };

  const win = new BrowserWindow({
    ...windowBounds, // 保存された幅と高さを復元
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableBlinkFeatures: "Bluetooth", // Bluetooth機能を明示的に許可
    },
  });

  win.loadFile("index.html");

  // Permissions Policyが適切に動作しているか確認
  win.webContents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      if (permission === "bluetooth") {
        callback(true); // Bluetoothのアクセスを許可
      } else {
        callback(false); // その他は拒否
      }
    }
  );

  // DevToolsを開く
  win.webContents.on("devtools-opened", () => {
    console.log("DevTools opened. Suppressing Autofill errors...");
    win.webContents.debugger.detach(); // DevToolsのAutofill関連プロトコルを無効化
  });
  win.webContents.openDevTools();

  // ウィンドウを閉じる際に現在のサイズを保存
  win.on("close", () => {
    const bounds = win.getBounds(); // 現在のウィンドウサイズを取得
    store.set("windowBounds", bounds);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
