import { contextBridge, ipcRenderer } from "electron";
import Chart from "chart.js/auto";

contextBridge.exposeInMainWorld("api", {
  // CSVファイルをインポート
  importCsv: (filePath) => ipcRenderer.send("import-csv", filePath),

  // データベースからデータを取得
  getData: () => ipcRenderer.send("get-data"),

  onBLEData: (callback) =>
    ipcRenderer.on("ble-data", (event, data) => callback(data)),

  // メッセージ受信
  onImportStatus: (callback) =>
    ipcRenderer.on("import-status", (event, message) => callback(message)),
  onDatabaseData: (callback) =>
    ipcRenderer.on("database-data", (event, data) => callback(data)),
});
