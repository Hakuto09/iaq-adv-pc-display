import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  // CSVファイルをインポート
  importCsv: (filePath) => ipcRenderer.send("import-csv", filePath),

  // データベースからデータを取得
  getData: () => ipcRenderer.send("get-data"),

  // メッセージ受信
  onImportStatus: (callback) =>
    ipcRenderer.on("import-status", (event, message) => callback(message)),
  onDatabaseData: (callback) =>
    ipcRenderer.on("database-data", (event, data) => callback(data)),
});
