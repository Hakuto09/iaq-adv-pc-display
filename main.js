import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import {
  importCsvToDatabase,
  exportCSVFromDatabase,
  insertDatabaseData,
  getDatabaseData,
} from "./database.js";
//const { importCsvToDatabase, getDatabaseData } = required("./database");
import { getIAQData } from "./iaqdata.js";
import Store from "electron-store";
const store = new Store();

import noble from "@abandonware/noble";

// ESモジュールで __dirname を定義するためのコード
import { fileURLToPath } from "url";
import { dirname } from "path";

// 現在のファイルのディレクトリを取得（__dirnameを定義）
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const openDevToolsFlag = false;

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
  if (openDevToolsFlag) win.webContents.openDevTools();

  // 現在のURLをログ出力
  win.webContents.on("did-finish-load", () => {
    console.log(`Electron is accessing URL: ${win.webContents.getURL()}`);
  });

  // ウィンドウを閉じる際に現在のサイズを保存
  win.on("close", () => {
    const bounds = win.getBounds(); // 現在のウィンドウサイズを取得
    store.set("windowBounds", bounds);
  });

  // 読み込み用ファイル選択ダイアログを開く処理
  ipcMain.handle("dialog:openFile", async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ["openFile"],
      filters: [
        { name: "CSV Files", extensions: ["csv"] }, // CSVファイルに絞る場合
      ],
    });
    return result.filePaths[0] || null; // 選択されたファイルのパスを返す
  });

  // 書き込み用ファイル選択ダイアログを開く処理
  ipcMain.handle("dialog:saveFile", async (event) => {
    const result = await dialog.showSaveDialog({
      title: "Save File",
      defaultPath: "output.csv", // 初期出力ファイルの名前
      filters: [
        { name: "CSV Files", extensions: ["csv"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    // ダイアログ操作結果を返す
    return result.filePath; // ユーザーが選択したファイルパス
  });

  return win;
}

function setupBleWatchMacFilter(win) {
  let pastDate;
  let manufacturerDataValidCount = 0;
  let isScanning = false;

  function getNowDateJstISOString() {
    const nowDate = new Date();
    const japanOffsetInMinutes = 9 * 60; // 日本時間：UTC+9=540分
    const utcTimestamp = nowDate.getTime();
    const japanTimestamp = utcTimestamp + japanOffsetInMinutes * 60 * 1000; // ミリ秒に変換して適用

    // 日本時間のタイムスタンプをDateオブジェクトに変換
    const japanDate = new Date(japanTimestamp);

    // ISO形式として保存（日本時間基準）
    return japanDate.toISOString().replace("Z", "+09:00");
  }

  ipcMain.on("startScan", (event, targetMAC) => {
    console.log('ipcMain.on("startScan"): In');
    if (isScanning) {
      event.reply("scanStatus", "スキャンはすでに実行中です！");
      return;
    }

    isScanning = true;

    if (noble.state === "poweredOn") {
      console.log("Before noble.startScanning():");
      noble.startScanning([], true);
      event.reply(
        "scanStatus",
        `スキャン開始: ターゲットMAC -> ${targetMAC.toLowerCase()} nowDateJst ${getNowDateJstISOString()}`
      );
      console.log("Scan Start: Target MAC ->", targetMAC.toLowerCase());
    } else {
      console.log("Before noble.once('stateChange'):");
      noble.once("stateChange", (state) => {
        if (state === "poweredOn") {
          noble.startScanning([], true);
          event.reply(
            "scanStatus",
            `スキャン開始 (stateChange): ターゲットMAC -> ${targetMAC.toLowerCase()} nowDateJst ${getNowDateJstISOString()}`
          );
          console.log(
            "Scan Start (stateChange):",
            `Target MAC ${targetMAC.toLowerCase()}`
          );
        } else if (state === "unknown" || state === "unsupported") {
          console.log(
            'noble: state === "unknown" or "unsupported":',
            `state ${state}`
          );
          event.reply(
            "scanStatus",
            "(stateChange): Bluetoothアダプタの状態を確認してください"
          );
          console.error("(stateChange): Please check Bluetooth setting.");
        } else {
          noble.stopScanning();
          event.reply(
            "scanStatus",
            "(stateChange): Bluetoothがオンになりません"
          );
          console.error("(stateChange): Cannot switch on Bluetooth.");
        }
      });
    }

    noble.on(
      "discover",
      /*async*/ (peripheral) => {
        //      console.log('noble.on("discover"): In');

        const currentMAC = peripheral.address;

        if (
          "0" === targetMAC.toLowerCase() ||
          currentMAC.toLowerCase() === targetMAC.toLowerCase()
        ) {
          const nowDateJstISOString = /*await*/ getNowDateJstISOString();
          //        console.log(`nowDateJstISOString ${nowDateJstISOString}`); // 例: "2023-10-01T21:43:15.000+09:00"
          const nowDate = new Date(nowDateJstISOString);

          const advertisement = peripheral.advertisement;
          const manufacturerData = advertisement.manufacturerData;

          let isGapOver = true;
          if (pastDate) isGapOver = nowDate - pastDate > 20000; // ms --> 20秒

          //console.log(`isGapOver ${isGapOver}`);

          if (manufacturerData) {
            if (isGapOver) {
              console.log(
                "Before manufacturerData.map():",
                "manufacturerData.map(typeof value):",
                manufacturerData.map((value) => typeof value)
              );
              const manufacturerDataLog = Array.from(manufacturerData)
                .map((value) => "0x" + value.toString(16).padStart(2, "0"))
                .join(" ");
              /*
              let manufacturerDataLog = "";
              manufacturerData.forEach(
                (value) =>
                  (manufacturerDataLog +=
                    "0x" + value.toString(16).padStart(2, "0") + " ")
              );
              */

              event.reply(
                "manufacturerData",
                `MAC Address: ${currentMAC.toLowerCase()} nowDate: ${nowDateJstISOString}`
              );
              event.reply("manufacturerData", manufacturerDataLog);
              console.log(`nowDate ${nowDate}`);
              console.log(`nowDateJstISOString ${nowDateJstISOString}`);
              console.log(`pastDate ${pastDate}`);
              console.log(`advertisement ${advertisement}`);
              console.log(`manufacturerDataLog ${manufacturerDataLog}`);
              console.log("manufacturerData Hex:");
              manufacturerData.forEach((value) =>
                console.log(`0x${value.toString(16).padStart(2, "0")}`)
              );

              const sendData = /*await*/ getIAQData(manufacturerData);
              console.log(
                "After getIAQData():",
                `sendData.error ${sendData.error}`
              );

              //            if (typeof sendData.temperature !== "undefined") {
              if (!sendData.error) {
                const padZero = (num) => num.toString().padStart(2, "0");
                const hours = padZero(nowDate.getHours());
                const minutes = padZero(nowDate.getMinutes());
                const seconds = padZero(nowDate.getSeconds());
                //const nowTime = `${hours}:${minutes}:${seconds}`;
                const nowTime = `${hours}:${minutes}`;

                /*await*/ insertDatabaseData(
                  nowDateJstISOString,
                  currentMAC.toLowerCase(),
                  sendData
                );

                const db_data = /*await*/ getDatabaseData(
                  targetMAC.toLowerCase()
                );
                console.log(
                  "After getDatabaseData()",
                  `targetMAC ${targetMAC}`,
                  `db_data ${JSON.stringify(db_data)}`
                );

                win.webContents.send("ble-data-with-date", sendData, nowTime);

                event.reply(
                  "manufacturerData",
                  `ValidCount ${manufacturerDataValidCount}`
                );

                console.log(
                  `sendData ${JSON.stringify(sendData)}`,
                  `nowDate ${nowDate}`,
                  `nowTime ${nowTime}`,
                  `manufacturerDataValidCount ${manufacturerDataValidCount}`
                );

                pastDate = nowDate;
                manufacturerDataValidCount++;
              } else {
                event.reply("manufacturerData", "sendData.error is true!!");

                console.log("sendData.error is true!!:", `nowDate ${nowDate}`);
              }
            } else {
              console.log("isGapOver = false!!:", `nowDate ${nowDate}`);
            }
          } else {
            event.reply(
              "advertisementData",
              "Manufacturer Dataが見つかりませんでした。"
            );
            console.log("Not Found Manufacturer Data!!:", `nowDate ${nowDate}`);
          }
        } else {
          /*
        console.log(
          "Not match with MAC Address!!:",
          "peripheral",
          peripheral.address.toLowerCase()
        );
        */
        }
      }
    );
  });

  ipcMain.on("stopScan", (event) => {
    console.log('ipcMain.on("stopScan"): In');
    noble.stopScanning();
    isScanning = false;
    event.reply("scanStatus", "スキャンを停止しました。");
    console.log("Scan Stopped.");
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
  console.log("ipcMain.on(import-csv): In.");
  try {
    console.log("Before importCsvToDatabase():", `filePath ${filePath}`);
    await importCsvToDatabase(filePath);
    event.reply("import-status", "CSV import successful!");
  } catch (err) {
    event.reply("import-status", `Error importing CSV: ${err.message}`);
  }
});

// データベースからデータを読み込み、ファイル出力を行う
ipcMain.on("export-csv", async (event, filePath, targetMAC) => {
  console.log("ipcMain.on(export-csv): In.");
  try {
    console.log("Before getDatabaseData():", `targetMAC ${targetMAC}`);
    const data = await getDatabaseData(targetMAC);
    console.log(
      "Before exportCSVFromDatabase():",
      `filePath ${filePath}`,
      `data ${data}`
    );
    exportCSVFromDatabase(filePath, data);
  } catch (err) {
    console.log(`error ${error} err.message ${err.message}`);
  }
});

// データベースからデータを読み込み、HTML表示を行う
ipcMain.on("get-data-and-display", async (event, targetMAC) => {
  console.log('ipcMain.on("get-data-and-display"): In.');
  try {
    console.log("Before getDatabaseData():", `targetMAC ${targetMAC}`);
    const data = await getDatabaseData(targetMAC);
    //    event.reply("database-data", data);
    event.reply("db-data-with-header", data);
  } catch (err) {
    //    event.reply("database-data", { error: err.message });
    event.reply("db-data-with-header", { error: err.message });
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
