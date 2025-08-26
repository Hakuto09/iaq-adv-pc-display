import sqlite3Init from "sqlite3";
const sqlite3 = sqlite3Init.verbose();
import fs from "fs";
import csvParser from "csv-parser";

const db = new sqlite3.Database("./iaq_data.db");

// テーブル作成の初期化
db.serialize(() => {
  console.log("Before db.run():");
  db.run(`
    CREATE TABLE IF NOT EXISTS IAQ (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      temperature REAL,
      humidity REAL,
      pm1_0 REAL,
      pm2_5 REAL,
      pm10 REAL,
      co2 INTEGER,
      tvoc INTEGER,
      ch2o INTEGER,
      co REAL
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
          temperature,
          humidity,
          pm1_0,
          pm2_5,
          pm10,
          co2,
          tvoc,
          ch2o,
          co
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          row.temperature,
          row.humidity,
          row.pm1_0,
          row.pm2_5,
          row.pm10,
          row.co2,
          row.tvoc,
          row.ch2o,
          row.co
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
  /*
  return new Promise((resolve, reject) => {
    console.log("Before db.all():");
    db.all("SELECT * FROM data", (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
  */
  return new Promise((resolve, reject) => {
    // SQLクエリでテーブルのすべてのデータを取得
    const sql = `SELECT temperature, humidity, pm1_0, pm2_5, pm10, co2, tvoc, ch2o, co FROM IAQ`;

    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error("Error fetching data:", err.message);
        reject(err);
        return;
      }

      // データ形式を再構築
      const reformattedData = {
        headers: [
          "temperature",
          "humidity",
          "pm1_0",
          "pm2_5",
          "pm10",
          "co2",
          "tvoc",
          "ch2o",
          "co",
        ], // ヘッダ名を定義
        rows: rows.map((row) => ({
          temperature: row.temperature,
          humidity: row.humidity,
          pm1_0: row.pm1_0,
          pm2_5: row.pm2_5,
          pm10: row.pm10,
          co2: row.co2,
          tvoc: row.tvoc,
          ch2o: row.ch2o,
          co: row.co,
        })),
      };

      resolve(reformattedData);
    });
  });
}
