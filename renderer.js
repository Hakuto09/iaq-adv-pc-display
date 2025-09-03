import { APP_VERSION } from "./version.js";

function btnControlAtScanInprogress() {
  const targetMACInput = document.getElementById("targetMAC");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const displayDataButton = document.getElementById("displayDataButton");
  const exportCsvButton = document.getElementById("exportCsvButton");

  targetMACInput.disabled = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  displayDataButton.disabled = false;
  exportCsvButton.disabled = true;
}

function btnControlAtScanStopped() {
  const targetMACInput = document.getElementById("targetMAC");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const displayDataButton = document.getElementById("displayDataButton");
  const exportCsvButton = document.getElementById("exportCsvButton");

  targetMACInput.disabled = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  displayDataButton.disabled = false;
  exportCsvButton.disabled = false;
}

function setup() {
  const log = document.getElementById("log");
  const targetMACInput = document.getElementById("targetMAC");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");

  log.textContent = "Application Version: " + APP_VERSION;

  btnControlAtScanStopped();

  startBtn.addEventListener("click", () => {
    const targetMAC = targetMACInput.value.trim();
    if (targetMAC) {
      log.textContent += "\n" + "スキャンを開始します...";
      window.electronAPI.startScan(targetMAC);
      btnControlAtScanInprogress();
    } else {
      log.textContent += "\n" + "MACアドレスを入力してください！";
    }
  });

  stopBtn.addEventListener("click", () => {
    log.textContent += "\n" + "スキャンを停止します...";
    window.electronAPI.stopScan();
    btnControlAtScanStopped();
  });

  window.electronAPI.onScanStatus((message) => {
    log.textContent += "\n" + message;
  });

  window.electronAPI.onManufacturerData((data) => {
    log.textContent += "\n" + "ManufacturerData: " + data;
  });
}

// CSVファイルのインポート処理
function setupCsvImport() {
  const importCsvButton = document.getElementById("importCsvButton");

  importCsvButton.addEventListener("click", async () => {
    const filePath = await window.electron.openFileDialog();
    if (filePath) {
      console.log("Before window.api.importCsv():", `filePath ${filePath}`);
      window.api.importCsv(filePath); // Electronのメインプロセスに送信
    } else {
      console.log("No file selected.");
    }
  });
}

// CSVファイルのエクスポート処理
function setupCsvExport() {
  const exportCsvButton = document.getElementById("exportCsvButton");

  exportCsvButton.addEventListener("click", async () => {
    const filePath = await window.electron.saveFileDialog();
    if (filePath) {
      const targetMACInput = document.getElementById("targetMAC");
      const targetMAC = targetMACInput.value.trim();

      console.log(
        "Before window.api.exportCsv():",
        `filePath ${filePath}`,
        `targetMAC ${targetMAC}`
      );
      window.api.exportCsv(filePath, targetMAC);
    } else {
      console.log("No file selected.");
    }
  });
}

function setupGetDataAndDisplay() {
  const fetchDataButton = document.getElementById("displayDataButton");

  fetchDataButton.addEventListener("click", () => {
    const targetMACInput = document.getElementById("targetMAC");
    const targetMAC = targetMACInput.value.trim();

    console.log(
      "Before window.api.getDataAndDisplay():",
      `targetMAC ${targetMAC}`
    );
    window.api.getDataAndDisplay(targetMAC);
  });
}

// インポート結果のメッセージ受信
function setupImportStatusReceiver() {
  console.log("Before window.api.onImportStatus():");
  window.api.onImportStatus((message) => {
    document.getElementById("statusMessage").innerText = message; // メッセージをHTMLに表示
  });
}

// データベースからのデータ受信・表示更新
function setupDatabaseDataReceiver() {
  /*
  window.api.onDatabaseData((data) => {
    const dataContainer = document.getElementById("databaseData");
    if (data.error) {
      dataContainer.innerText = `Error: ${data.error}`; // エラーがあれば記述
    } else {
      const tableRows = data
        .map(
          (row) =>
            `<tr>
           <td>${row.id}</td>
           <td>${row.input_data_type}</td>
           <td>${row.device_protocol}</td>
           <td>${row.topicName}</td>
           <td>${row.device_id}</td>
           <td>${row.createdAt}</td>
           <td>${row.createdAt_c}</td>
           <td>${row.Temperature}</td>
           <td>${row.Humidity}</td>
           <td>${row.PM1_0}</td>
           <td>${row.PM2_5}</td>
           <td>${row.PM10}</td>
         </tr>`
        )
        .join("");

      // データをHTMLテーブル形式で表示
      dataContainer.innerHTML = `
        <table>
          <tr>
            <th>ID</th>
            <th>input_data_type</th>
            <th>device_protocol</th>
            <th>topicName</th>
            <th>device_id</th>
            <th>createdAt</th>
            <th>createdAt_c</th>
            <th>Temperature</th>
            <th>Humidity</th>
            <th>PM1_0</th>
            <th>PM2_5</th>
            <th>PM10</th>
          </tr>
          ${tableRows}
        </table>
      `;
    }
  });
  */

  window.api.onDBDataWithHeader((data) => {
    const dataContainer = document.getElementById("databaseData");

    if (data.error) {
      dataContainer.innerText = `Error: ${data.error}`; // エラーがあれば記述
    } else {
      // ヘッダと行データを分割して取得する
      const { headers, rows } = data; // `data` は {headers: [...], rows: [...]} の構造を想定

      // ヘッダ行を作成
      const headerRow = headers.map((header) => `<th>${header}</th>`).join("");

      // データ行を作成
      const tableRows = rows
        .map(
          (row) =>
            `<tr>${headers
              .map((header) => `<td>${row[header]}</td>`)
              .join("")}</tr>`
        )
        .join("");

      console.log(
        "Before change dataContainer.innerHTML:",
        `headers: ${headers}`,
        `rows: ${rows}`
      );

      // テーブルを生成して `innerHTML` を設定
      dataContainer.innerHTML = `
        <table class="styled-table">
          <tr>
            ${headerRow}
          </tr>
            ${tableRows}
        </table>
      `;
    }
  });
}

function setupValueAndChart() {
  // 要素を取得
  const valueTemperature = document.getElementById("value-temperature");
  const valueHumidity = document.getElementById("value-humidity");
  const valuePM1_0 = document.getElementById("value-pm1_0");
  const valuePM2_5 = document.getElementById("value-pm2_5");
  const valuePM10 = document.getElementById("value-pm10");
  const valueCO2 = document.getElementById("value-co2");
  const valueTVOC = document.getElementById("value-tvoc");
  const valueCH2O = document.getElementById("value-ch2o");
  const valueCO = document.getElementById("value-co");

  function updateBoxValue(data) {
    valueTemperature.textContent = data.temperature;
    valueHumidity.textContent = data.humidity;
    valuePM1_0.textContent = data.pm1_0;
    valuePM2_5.textContent = data.pm2_5;
    valuePM10.textContent = data.pm10;
    valueCO2.textContent = data.co2;
    valueTVOC.textContent = data.tvoc;
    valueCH2O.textContent = data.ch2o;
    valueCO.textContent = data.co;
  }

  /*
  const defaultOptions = {
    responsive: false, // レスポンシブを無効化
    maintainAspectRatio: false, // アスペクト比を維持しない
  };
  */

  const dataLabelsPlugin = {
    id: "dataLabels",
    beforeDraw: (chart) => {
      const ctx = chart.ctx;
      const dataset = chart.data.datasets[0];
      const meta = chart.getDatasetMeta(0); // データのメタ情報を取得
      const yAxis = chart.scales.y;

      meta.data.forEach((element, index) => {
        // 各ポイントのX,Y座標を取得
        const x = element.x;
        const y = element.y;

        // 数値ラベルを描画
        const value = dataset.data[index];
        ctx.fillStyle = "black"; // ラベルの色
        ctx.font = "12px Arial"; // ラベルのフォント
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(value, x + 10, y - 10); // 数値を少し上に描画
      });
    },
  };

  // グラフの設定
  const ctxTemperature = document
    .getElementById("chart-temperature")
    .getContext("2d");
  const chartTemperature = new Chart(ctxTemperature, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Temperature",
          data: [],
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: true,
      layout: {
        padding: {
          left: 10, // グラフの右側余白を広げる
          right: 30, // グラフの右側余白を広げる
        },
      },
      scales: {
        y: {
          title: {
            display: true,
            text: "[ ℃ ]", // 軸全体のタイトル
          },
          min: 0, // Y軸の最小値
          max: 50, // Y軸の最大値
          ticks: {
            stepSize: 5, // Y軸の目盛り間隔
          },
        },
        x: {
          title: {
            display: true,
            text: "time", // X軸のタイトル
          },
          ticks: {
            autoSkip: false, // ラベルを自動でスキップしない
            maxRotation: 45, // 最大角度 (45度まで回転)
            minRotation: 45, // 最小角度 (45度で固定)
          },
        },
      },
    },
    plugins: [dataLabelsPlugin],
  });

  const ctxHumidity = document
    .getElementById("chart-humidity")
    .getContext("2d");
  const chartHumidity = new Chart(ctxHumidity, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Humidity",
          data: [],
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: true,
      layout: {
        padding: {
          left: 10, // グラフの右側余白を広げる
          right: 30, // グラフの右側余白を広げる
        },
      },
      scales: {
        y: {
          title: {
            display: true,
            text: "[ % ]", // 軸全体のタイトル
          },
          min: 0, // Y軸の最小値
          max: 100, // Y軸の最大値
          ticks: {
            stepSize: 10, // Y軸の目盛り間隔
          },
        },
        x: {
          title: {
            display: true,
            text: "time", // X軸のタイトル
          },
          ticks: {
            autoSkip: false, // ラベルを自動でスキップしない
            maxRotation: 45, // 最大角度 (45度まで回転)
            minRotation: 45, // 最小角度 (45度で固定)
          },
        },
      },
    },
    plugins: [dataLabelsPlugin],
  });

  const ctxCO2 = document.getElementById("chart-co2").getContext("2d");
  const chartCO2 = new Chart(ctxCO2, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "CO2",
          data: [],
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: true,
      layout: {
        padding: {
          left: 10, // グラフの右側余白を広げる
          right: 30, // グラフの右側余白を広げる
        },
      },
      scales: {
        y: {
          title: {
            display: true,
            text: "[ ppm ]", // 軸全体のタイトル
          },
          min: 0, // Y軸の最小値
          max: 3000, // Y軸の最大値
          ticks: {
            stepSize: 500, // Y軸の目盛り間隔
          },
        },
        x: {
          title: {
            display: true,
            text: "time", // X軸のタイトル
          },
          ticks: {
            autoSkip: false, // ラベルを自動でスキップしない
            maxRotation: 45, // 最大角度 (45度まで回転)
            minRotation: 45, // 最小角度 (45度で固定)
          },
        },
      },
    },
    plugins: [dataLabelsPlugin],
  });

  function updateCharts(data, date) {
    const limit = 10;
    updateChart(chartTemperature, date, data.temperature, limit);
    updateChart(chartHumidity, date, data.humidity, limit);
    updateChart(chartCO2, date, data.co2, limit);
  }

  // BLEデータ受信時の処理
  window.electronAPI.onBLEDataWithDate((data, date) => {
    console.log("Device discovered:", `data ${data}`, `date ${date}`);

    updateBoxValue(data);

    // リスト要素の追加
    /*
    const deviceList = document.getElementById("deviceList");
    const listItem = document.createElement("li");
    listItem.innerText = `${date} Temperature: ${data.temperature} Humidity: ${data.humidity} CO2: ${data.co2}`;
    deviceList.appendChild(listItem);
    */

    updateCharts(data, date);
  });
}

function updateChart(chart, date, data, limit) {
  chart.data.labels.push(date); // X軸ラベルに新しいデータを追加
  chart.data.datasets[0].data.push(data); // Y軸データに新しいデータを追加

  // データが10個を超えた場合、古いデータを削除
  if (chart.data.labels.length > limit) {
    chart.data.labels.shift(); // 配列の最初の要素を削除
    chart.data.datasets[0].data.shift(); // データセットの最初の値を削除
  }

  chart.update();
}

/*
function setupChart() {
  // グラフの設定
  const ctx = document.getElementById("chartOfRssi").getContext("2d");
  //  console.log("Before new Chart: window.api.Chart ", window.api.Chart);
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "RSSI Value",
          data: [],
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
  });

  // BLEデータ受信時の処理
  window.api.onBLEData((data) => {
    console.log("Device discovered:", data);

    // リスト要素の追加
    const deviceList = document.getElementById("deviceList");
    const listItem = document.createElement("li");
    listItem.innerText = `${data.name || "Unknown Device"} (ID: ${
      data.id
    }) RSSI: ${data.rssi}`;
    deviceList.appendChild(listItem);

    // グラフデータに追加
    chart.data.labels.push(data.name || "Unknown Device");
    chart.data.datasets[0].data.push(data.rssi);
    chart.update();
  });
}
*/

// 初期化処理
function initialize() {
  console.log("initialize(): In");
  setup();
  setupCsvImport();
  setupCsvExport();
  setupGetDataAndDisplay();
  setupImportStatusReceiver();
  setupDatabaseDataReceiver();
  setupValueAndChart();
  //  setupChart();
}

// ページをロード後に初期化
document.addEventListener("DOMContentLoaded", initialize);
document.addEventListener("DOMContentLoaded", initialize);
