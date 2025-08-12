import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { importCsvToDatabase, getDatabaseData } from "./database";
import Store from "electron-store";
const store = new Store();

function createWindow() {
  // 以前保存したウィンドウサイズを取得
  const windowBounds = store.get("windowBounds") || { width: 800, height: 600 };

  const win = new BrowserWindow({
    ...windowBounds, // 保存された幅と高さを復元
    webPreferences: {
      //enableBlinkFeatures: false, // Blink機能を無効化
      enableBlinkFeatures: "Bluetooth", // Bluetooth機能を明示的に許可
      //contextIsolation: true, // コンテキストの分離を有効化 (推奨)
      contextIsolation: false,
      //      nodeIntegration: true,
      nodeIntegration: false, // Node.jsモジュールの統合を無効化
      sandbox: true, // サンドボックス化 (推奨)
      webSecurity: true, // ウェブセキュリティを有効化    },
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

  // 現在のURLをログ出力
  win.webContents.on("did-finish-load", () => {
    console.log(`Electron is accessing URL: ${win.webContents.getURL()}`);
  });

  // ウィンドウを閉じる際に現在のサイズを保存
  win.on("close", () => {
    const bounds = win.getBounds(); // 現在のウィンドウサイズを取得
    store.set("windowBounds", bounds);
  });
}

app.commandLine.appendSwitch("enable-experimental-web-platform-features"); // Web Bluetooth 実験機能を有効化

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// CSVファイルからデータベースに書き込む処理
ipcMain.on("import-csv", async (event, filePath) => {
  try {
    await importCsvToDatabase(filePath);
    event.reply("import-status", "CSV import successful!");
  } catch (err) {
    event.reply("import-status", `Error importing CSV: ${err.message}`);
  }
});

// データベースからデータを読み込む処理
ipcMain.on("get-data", async (event) => {
  try {
    const data = await getDatabaseData();
    event.reply("database-data", data);
  } catch (err) {
    event.reply("database-data", { error: err.message });
  }
});
