import { contextBridge, ipcRenderer } from "electron";

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

  getSelectedFilePath: (callback) => {
    ipcRenderer.on("file-selected", (event, filePath) => {
      console.log("Before getSelectedFilePath's callback: filePath ", filePath);
      callback(filePath);
    });
  },
});

/*
contextBridge.exposeInMainWorld("fileAPI", {
  getSelectedFilePath: (callback) => {
    ipcRenderer.on("file-selected", (event, filePath) => {
      console.log("Before getSelectedFilePath's callback: filePath ", filePath);
      callback(filePath);
    });
  },
});
*/

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel, data) => {
      ipcRenderer.send(channel, data);
    },
    on: (channel, callback) => {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    },
  },
});
