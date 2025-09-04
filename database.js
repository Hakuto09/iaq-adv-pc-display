import sqlite3Init from "sqlite3";
const sqlite3 = sqlite3Init.verbose();
import fs from "fs";
import csvParser from "csv-parser";

const db = new sqlite3.Database("./iaq_data.db");

// テーブル作成の初期化
db.serialize(() => {
  console.log("Before db.run():");
  // 小数点表示の問題等あり、データ値は全て文字列に。
  //    id INTEGER PRIMARY KEY AUTOINCREMENT,
  db.run(`
    CREATE TABLE IF NOT EXISTS IAQ (
      date_jst_iso TEXT PRIMARY KEY,
      mac_address TEXT,
      temperature TEXT,
      humidity TEXT,
      pm1_0 TEXT,
      pm2_5 TEXT,
      pm10 TEXT,
      co2 TEXT,
      tvoc TEXT,
      ch2o TEXT,
      co TEXT
    )
  `);
});

// CSVファイルをデータベースにインポート
export function importCsvToDatabase(filePath) {
  return new Promise((resolve, reject) => {
    console.log("Before db.prepare():");
    const stmt = db.prepare(
      `
        INSERT INTO IAQ (
          date_jst_iso,
          mac_address,
          temperature,
          humidity,
          pm1_0,
          pm2_5,
          pm10,
          co2,
          tvoc,
          ch2o,
          co
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    );
    console.log("Before fs.createReadStream():");
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        // CSVの各行をデータベースに挿入
        //const temperature = parseFloat(row.temperature).toFixed(1); // 文字列から数値に変換
        //const humidity = parseFloat(row.humidity).toFixed(1); // 文字列から数値に変換
        //const co = parseFloat(row.co).toFixed(1); // 文字列から数値に変換
        /*
        console.log(
          "Before stmt.run():",
          `typeof row.temperature ${typeof row.temperature}`,
          `row.temperature ${row.temperature}`,
          `temperature ${temperature}`
        );
        */
        stmt.run(
          row.date_jst_iso,
          row.mac_address,
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

// SQLiteテーブルからデータを読み取り、CSVに出力する関数
export function exportCSVFromDatabase(outputFilePath, data) {
  console.log("exportCSVFromDatabase(): In.");

  const headers = data.headers;
  const rows = data.rows;

  console.log(
    "exportCSVFromDatabase():",
    `headers.length ${headers.length}`,
    `rows.length ${rows.length}`
  );

  if (rows.length === 0) {
    console.log("exportCSVFromDatabase(): No data found in database.");
    return;
  }

  // CSVデータへの変換
  const csvContent = [headers.join(",")]; // ヘッダー行作成
  console.log(
    "exportCSVFromDatabase():",
    "After headers.join():",
    `csvContent ${csvContent}`
  );

  rows.forEach((row) => {
    const values = headers.map((header) => row[header]); // 各列の値を取得
    csvContent.push(values.join(",")); // 各行をCSV形式で追加
    console.log(
      "exportCSVFromDatabase():",
      "After values.join():",
      `csvContent ${csvContent}`
    );
  });
  console.log(
    "exportCSVFromDatabase():",
    "After rows.forEach():",
    `csvContent ${csvContent}`
  );
  csvContent.slice(0, 10).forEach((value, i) => {
    console.log(`csvContent[${i}] ${value}`);
  });

  // ファイルを書き出し
  fs.writeFile(outputFilePath, csvContent.join("\n"), "utf8", (err) => {
    if (err) {
      console.error(`Error writing to CSV file: ${err.message}`);
      return;
    }
    console.log(`CSV file has been created successfully: ${outputFilePath}`);
  });
}

// データをデータベースへ格納
export function insertDatabaseData(japanTimeISOString, currentMAC, sendData) {
  console.log(
    "insertDatabaseData(): Before stmt.run()",
    `japanTimeISOString ${japanTimeISOString}`,
    `currentMAC ${currentMAC}`,
    `sendData ${JSON.stringify(sendData)}`
  );
  db.run(
    `
      INSERT INTO IAQ (
        date_jst_iso,
        mac_address,
        temperature,
        humidity,
        pm1_0,
        pm2_5,
        pm10,
        co2,
        tvoc,
        ch2o,
        co
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      japanTimeISOString,
      currentMAC,
      sendData.temperature,
      sendData.humidity,
      sendData.pm1_0,
      sendData.pm2_5,
      sendData.pm10,
      sendData.co2,
      sendData.tvoc,
      sendData.ch2o,
      sendData.co,
    ],
    function (err) {
      if (err) {
        console.error(
          "insertDatabaseData(): Error inserting data:",
          err.message
        );
      } else {
        console.log(
          `insertDatabaseData(): Row inserted with ID: ${this.lastID}`
        );
      }
    }
  );
}

// データベースからデータを取得
export function getDatabaseData(targetMAC) {
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
    // SQLクエリでテーブルのデータを取得
    const sql =
      "0" === targetMAC
        ? `SELECT * FROM IAQ`
        : `SELECT * FROM IAQ WHERE LOWER(mac_address) = LOWER("${targetMAC}")`;
    console.log("Before db.all():", `sql ${sql}`, `targetMAC ${targetMAC}`);

    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error("Error fetching data:", err.message);
        reject(err);
        return;
      }

      // データ形式を再構築
      const reformattedData = {
        headers: [
          //"id",
          "date_jst_iso",
          "mac_address",
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
          //          id: row.id,
          date_jst_iso: row.date_jst_iso,
          mac_address: row.mac_address,
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

      console.log(
        "getDatabaseData():",
        "Before db.all() - resolve():",
        `reformattedData ${JSON.stringify(reformattedData)}`
      );
      resolve(reformattedData);
    });
  });
}
