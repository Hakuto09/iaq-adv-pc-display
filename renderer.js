//const Chart = window.api.getChartLibrary();
//const Chart2 = window.api.Chart;

function setup() {
  const logDiv = document.getElementById("log");
  const macAddressInput = document.getElementById("macAddress");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");

  startBtn.addEventListener("click", () => {
    const macAddress = macAddressInput.value.trim();
    if (macAddress) {
      logDiv.textContent = "スキャンを開始します...";
      window.electronAPI.startScan(macAddress);
    } else {
      logDiv.textContent = "MACアドレスを入力してください！";
    }
  });

  stopBtn.addEventListener("click", () => {
    logDiv.textContent = "スキャンを停止します...";
    window.electronAPI.stopScan();
  });

  window.electronAPI.onScanStatus((message) => {
    logDiv.textContent += "\n" + message;
  });

  window.electronAPI.onAdvertisementData((data) => {
    logDiv.textContent += "\n--- Advertisement Data ---\n" + data;
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

function setupChartMacFilter() {
  const defaultOptions = {
    responsive: false, // レスポンシブを無効化
    maintainAspectRatio: false, // アスペクト比を維持しない
  };

  // グラフの設定
  const ctxTemperature = document
    .getElementById("chartOfTemperature")
    .getContext("2d");
  const chartTemperature = new Chart(ctxTemperature, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Temperature Value",
          data: [],
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: defaultOptions,
  });

  const ctxHumidity = document
    .getElementById("chartOfHumidity")
    .getContext("2d");
  const chartHumidity = new Chart(ctxHumidity, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Humidity Value",
          data: [],
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: defaultOptions,
  });

  const ctxCO2 = document.getElementById("chartOfCO2").getContext("2d");
  const chartCO2 = new Chart(ctxCO2, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "CO2 Value",
          data: [],
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: defaultOptions,
  });

  // BLEデータ受信時の処理
  window.electronAPI.onBLEDataMacFilter((data, date) => {
    console.log("Device discovered:", data, "date", date);

    // リスト要素の追加
    const deviceList = document.getElementById("deviceList");
    const listItem = document.createElement("li");
    listItem.innerText = `${date} Temperature: ${data.temperature} Humidity: ${data.humidity} CO2: ${data.co2}`;
    deviceList.appendChild(listItem);

    // グラフデータに追加
    chartTemperature.data.labels.push(date);
    chartTemperature.data.datasets[0].data.push(data.temperature);
    chartTemperature.update();

    chartHumidity.data.labels.push(date);
    chartHumidity.data.datasets[0].data.push(data.humidity);
    chartHumidity.update();

    chartCO2.data.labels.push(date);
    chartCO2.data.datasets[0].data.push(data.co2);
    chartCO2.update();
  });
}

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

// 初期化処理
function initialize() {
  console.log("initialize(): In");
  setup();
  setupCsvImport();
  setupImportStatusReceiver();
  setupDataFetch();
  setupDatabaseDataReceiver();
  setupChartMacFilter();
  setupChart();
}

// ページをロード後に初期化
document.addEventListener("DOMContentLoaded", initialize);
