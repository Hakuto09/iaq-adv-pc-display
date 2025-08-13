//const Chart = window.api.getChartLibrary();
//const Chart2 = window.api.Chart;

// CSVファイルのインポート処理
function setupCsvImport() {
  const importCsvButton = document.getElementById("importCsvButton");
  importCsvButton.addEventListener("click", () => {
    const fileInput = document.getElementById("csvFile");
    if (fileInput.files.length > 0) {
      const filePath = fileInput.files[0].path; // CSVファイルのパスを取得
      console.log("Before window.api.importCsv():");
      window.api.importCsv(filePath); // Electronのメインプロセスに送信
    } else {
      alert("Please select a CSV file!");
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

function setupChart() {
  // グラフの設定
  const ctx = document.getElementById("myChart").getContext("2d");
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
  setupCsvImport();
  setupImportStatusReceiver();
  setupDataFetch();
  setupDatabaseDataReceiver();
  setupChart();
}

// ページをロード後に初期化
document.addEventListener("DOMContentLoaded", initialize);
