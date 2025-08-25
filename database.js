import sqlite3Init from "sqlite3";
const sqlite3 = sqlite3Init.verbose();
import fs from "fs";
import csvParser from "csv-parser";

const db = new sqlite3.Database("./data.db");

// テーブル作成の初期化
db.serialize(() => {
  /*
  db.run(`
    CREATE TABLE IF NOT EXISTS data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      age INTEGER,
      profession TEXT
    )
  `);
  */
  console.log("Before db.run():");
  db.run(`
    CREATE TABLE IF NOT EXISTS data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      input_data_type INTEGER,
      device_protocol TEXT,
      topicName TEXT,
      device_id TEXT,
      createdAt TEXT,
      createdAt_c TEXT,
      Temperature REAL,
      Humidity REAL,
      PM1_0 REAL,
      PM2_5 REAL,
      PM10 REAL
    )
  `);
});

// CSVファイルをデータベースにインポート
export function importCsvToDatabase(filePath) {
  return new Promise((resolve, reject) => {
    console.log("Before db.prepare():");
    const stmt = db.prepare(
      //      `INSERT INTO data (name, age, profession) VALUES (?, ?, ?)`
      `
        INSERT INTO data (
            input_data_type,
            device_protocol,
            topicName,
            device_id,
            createdAt,
            createdAt_c,
            Temperature,
            Humidity,
            PM1_0,
            PM2_5,
            PM10
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    );
    console.log("Before fs.createReadStream():");
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        // CSVの各行をデータベースに挿入
        console.log("Before stmt.run():");
        //        stmt.run(row.name, row.age, row.profession);
        stmt.run(
          row.input_data_type,
          row.device_protocol,
          row.topicName,
          row.device_id,
          row.createdAt,
          row.createdAt_c,
          row.Temperature,
          row.Humidity,
          row.PM1_0,
          row.PM2_5,
          row.PM10
        );
      })
      .on("end", () => {
        console.log("Before stmt.finalize():");
        stmt.finalize();
        console.log("Before resolve():");
        resolve();
      })
      .on("error", reject);
  });
}

// データベースからデータを取得
export function getDatabaseData() {
  return new Promise((resolve, reject) => {
    console.log("Before db.all():");
    db.all("SELECT * FROM data", (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

//module.exports = { importCsvToDatabase, getDatabaseData };
