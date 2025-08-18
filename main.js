import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { importCsvToDatabase, getDatabaseData } from "./database.js";
//const { importCsvToDatabase, getDatabaseData } = required("./database");
import Store from "electron-store";
const store = new Store();

import noble from "@abandonware/noble";

// ESモジュールで __dirname を定義するためのコード
import { fileURLToPath } from "url";
import { dirname } from "path";

// 現在のファイルのディレクトリを取得（__dirnameを定義）
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let pastDate;

function createWindow() {
  // 以前保存したウィンドウサイズを取得
  const windowBounds = store.get("windowBounds") || { width: 800, height: 600 };

  console.log(
    "Before new BrowserWindow(): Path of preload.js:",
    path.join(__dirname, "preload.js")
  );

  const win = new BrowserWindow({
    ...windowBounds, // 保存された幅と高さを復元
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // preload.js を設定
      //enableBlinkFeatures: false, // Blink機能を無効化
      enableBlinkFeatures: "Bluetooth", // Bluetooth機能を明示的に許可
      contextIsolation: true, // コンテキストの分離を有効化 (true推奨)
      nodeIntegration: false, // Node.jsモジュールの統合を無効化
      sandbox: false, // サンドボックス化 (true推奨)
      webSecurity: true, // ウェブセキュリティを有効化
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

  // ファイル選択ダイアログを開く処理
  ipcMain.handle("dialog:openFile", async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ["openFile"],
      filters: [
        { name: "CSV Files", extensions: ["csv"] }, // CSVファイルに絞る場合
      ],
    });
    return result.filePaths[0] || null; // 選択されたファイルのパスを返す
  });

  return win;
}

function setupBleWatchMacFilter(win) {
  let isScanning = false;

  ipcMain.on("startScan", (event, macAddress) => {
    if (isScanning) {
      event.reply("scanStatus", "スキャンはすでに実行中です！");
      return;
    }

    isScanning = true;
    noble.on("stateChange", (state) => {
      if (state === "poweredOn") {
        noble.startScanning([], true);
        event.reply(
          "scanStatus",
          `スキャン開始: ターゲットMAC -> ${macAddress}`
        );
        console.log("スキャン開始: ターゲットMAC ->", macAddress);
      } else {
        noble.stopScanning();
        event.reply("scanStatus", "BLEがオフになっています！");
      }
    });

    noble.on("discover", (peripheral) => {
      if (peripheral.address.toLowerCase() === macAddress.toLowerCase()) {
        const nowDate = new Date();
        const advertisement = peripheral.advertisement;
        const manufacturerData = advertisement.manufacturerData;

        let isGapOver = true;
        if (pastDate) isGapOver = nowDate - pastDate > 20000; // ms --> 20秒

        console.log("pastDate", pastDate);
        console.log("nowDate", nowDate);
        console.log("isGapOver", isGapOver);

        if (manufacturerData && isGapOver) {
          const logData = manufacturerData
            .map(
              (byte, index) =>
                `Byte ${index + 1}: 0x${byte.toString(16).padStart(2, "0")}`
            )
            .join("\n");

          event.reply("advertisementData", logData);
          console.log("advertisement", advertisement);
          console.log("manufacturerData", manufacturerData);
          console.log("manufacturerData[1]", manufacturerData[1]);
          //          console.log("logData", logData);
          const sendData = {
            temperature: 0,
            humidity: 0,
            co2: 0,
          };
          sendData.temperature = manufacturerData[1]; // temporary!!
          sendData.humidity = manufacturerData[3]; // temporary!!
          sendData.co2 = manufacturerData[5]; // temporary!!

          const padZero = (num) => num.toString().padStart(2, "0");
          const hours = padZero(nowDate.getHours());
          const minutes = padZero(nowDate.getMinutes());
          const seconds = padZero(nowDate.getSeconds());
          const nowTime = `${hours}:${minutes}:${seconds}`;

          console.log("sendData", sendData, "nowTime", nowTime);
          win.webContents.send("ble-data-with-date", sendData, nowTime);

          pastDate = nowDate;
        } else {
          event.reply(
            "advertisementData",
            "Manufacturer Dataが見つかりませんでした。"
          );
          console.log("Not Found Manufacturer Data!!");
        }
      }
    });
  });

  ipcMain.on("stopScan", (event) => {
    noble.stopScanning();
    isScanning = false;
    event.reply("scanStatus", "スキャンを停止しました。");
  });
}

function setupBleWatch(win) {
  noble.on("stateChange", (state) => {
    if (state === "poweredOn") {
      console.log("Starting BLE scan...");
      noble.startScanning([], true); // アドバタイズパケットを取得
    } else {
      noble.stopScanning();
    }
  });

  // アドバタイズパケットが検出されるたびに送信
  noble.on("discover", (peripheral) => {
    const advertiseData = {
      id: peripheral.id,
      name: peripheral.advertisement.localName,
      rssi: peripheral.rssi,
    };
    win.webContents.send("ble-data", advertiseData); // レンダラープロセスに送信
  });
}

app.commandLine.appendSwitch("enable-experimental-web-platform-features"); // Web Bluetooth 実験機能を有効化

app.whenReady().then(() => {
  console.log(
    "Before createWindow(): Path of preload.js:",
    path.join(__dirname, "preload.js")
  );

  const win = createWindow();

  setupBleWatchMacFilter(win);
  //  setupBleWatch(win);

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
    console.log("Before importCsvToDatabase(): filePath", filePath);
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

/*
// メインプロセスで 'file-select' イベントを受け取る
ipcMain.on("file-select", (event, filePath) => {
  console.log("File path received at main.js: filePath ", filePath);

  // ファイルパスをレンダラープロセスに返す
  //  win.webContents.send("file-selected", filePath);
  event.reply("file-selected", filePath);
});
*/
