import sqlite3Init from "sqlite3";
const sqlite3 = sqlite3Init.verbose();
import fs from "fs";
import csvParser from "csv-parser";

const db = new sqlite3.Database("./data.db");

// テーブル作成の初期化
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      age INTEGER,
      profession TEXT
    )
  `);
});

// CSVファイルをデータベースにインポート
function importCsvToDatabase(filePath) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(
      `INSERT INTO data (name, age, profession) VALUES (?, ?, ?)`
    );
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        // CSVの各行をデータベースに挿入
        stmt.run(row.name, row.age, row.profession);
      })
      .on("end", () => {
        stmt.finalize();
        resolve();
      })
      .on("error", reject);
  });
}

// データベースからデータを取得
function getDatabaseData() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM data", (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

module.exports = { importCsvToDatabase, getDatabaseData };
