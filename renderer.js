//import ChartDataLabels from "chartjs-plugin-datalabels";

function setup() {
  const log = document.getElementById("log");
  const macAddressInput = document.getElementById("macAddress");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");

  startBtn.addEventListener("click", () => {
    const macAddress = macAddressInput.value.trim();
    if (macAddress) {
      log.textContent = "スキャンを開始します...";
      window.electronAPI.startScan(macAddress);
    } else {
      log.textContent = "MACアドレスを入力してください！";
    }
  });

  stopBtn.addEventListener("click", () => {
    log.textContent += "スキャンを停止します...";
    window.electronAPI.stopScan();
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
    /*
      const fileInput = document.getElementById("csvFile");
    if (fileInput.files.length > 0) {
      console.log(
        "Before get fileInput.files[0].path: fileInput.files.length: ",
        fileInput.files.length
      );
      const filePath = fileInput.files[0].path; // CSVファイルのパスを取得

      window.electron.ipcRenderer.send("file-select", filePath);

      console.log("Before window.api.importCsv(): filePath ", filePath);
      window.api.importCsv(filePath); // Electronのメインプロセスに送信
    } else {
      alert("Please select a CSV file!");
      }

    window.electron.ipcRenderer.on("file-selected", (filePath) => {
        console.log("File path received from main process:", filePath);
        window.api.importCsv(filePath); // Electronのメインプロセスに送信
    });
      */

    const filePath = await window.electron.openFileDialog();
    if (filePath) {
      console.log("Before window.api.importCsv(): filePath ", filePath);
      window.api.importCsv(filePath); // Electronのメインプロセスに送信
    } else {
      console.log("No file selected");
    }
  });
}

// インポート結果のメッセージ受信
function setupImportStatusReceiver() {
  console.log("Before window.api.onImportStatus():");
  window.api.onImportStatus((message) => {
    document.getElementById("statusMessage").innerText = message; // メッセージをHTMLに表示
  });
}

// データの取得処理
function setupDataFetch() {
  const fetchDataButton = document.getElementById("fetchDataButton");
  fetchDataButton.addEventListener("click", () => {
    console.log("Before window.api.getData():");
    window.api.getData(); // データ取得要求をメインプロセスに送信
  });
}

// データベースからのデータ受信・表示更新
function setupDatabaseDataReceiver() {
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
           <td>${row.name}</td>
           <td>${row.age}</td>
           <td>${row.profession}</td>
         </tr>`
        )
        .join("");

      // データをHTMLテーブル形式で表示
      dataContainer.innerHTML = `
        <table>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Profession</th>
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
  const valueCO2 = document.getElementById("value-co2");
  const valueTVOC = document.getElementById("value-tvoc");
  const valueCO = document.getElementById("value-co");
  const valuePM1_0 = document.getElementById("value-pm1_0");
  const valuePM2_5 = document.getElementById("value-pm2_5");
  const valuePM10 = document.getElementById("value-pm10");
  const valueCH2O = document.getElementById("value-ch2o");

  // 初期化：経過秒数の変数を作成
  let secondsElapsed = 0;

  function updateBoxValue(data) {
    valueTemperature.textContent = data.temperature;
    valueHumidity.textContent = data.humidity;
    valueCO2.textContent = data.co2;
    valueTVOC.textContent = data.tvoc;
    valueCO.textContent = data.co;
    valuePM1_0.textContent = data.pm1_0;
    valuePM2_5.textContent = data.pm2_5;
    valuePM10.textContent = data.pm10;
    valueCH2O.textContent = data.ch2o;
  }

  // ※暫定表示テスト用：10秒毎に更新する処理を開始
  /*
  setInterval(() => {
    secondsElapsed += 10; // 経過秒数を10秒ずつ加算
    valueTemperature.textContent = `${secondsElapsed}`; // テキストを更新
    valueHumidity.textContent = `${secondsElapsed}`; // テキストを更新
    valueCO2.textContent = `${secondsElapsed}`; // テキストを更新
    valueTVOC.textContent = `${secondsElapsed}`; // テキストを更新
    valueCO.textContent = `${secondsElapsed}`; // テキストを更新
    valuePM1_0.textContent = `${secondsElapsed}`; // テキストを更新
    valuePM2_5.textContent = `${secondsElapsed}`; // テキストを更新
    valuePM10.textContent = `${secondsElapsed}`; // テキストを更新
    valueCH2O.textContent = `${secondsElapsed}`; // テキストを更新
  }, 10000); // 10,000ミリ秒 = 10秒
*/

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
    console.log("Device discovered:", "data", data, "date", date);

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
  setupImportStatusReceiver();
  setupDataFetch();
  setupDatabaseDataReceiver();
  setupValueAndChart();
  //  setupChart();
}

// ページをロード後に初期化
document.addEventListener("DOMContentLoaded", initialize);
