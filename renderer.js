// CSVファイルのインポート処理
function setupCsvImport() {
  const importCsvButton = document.getElementById("importCsvButton");
  importCsvButton.addEventListener("click", () => {
    const fileInput = document.getElementById("csvFile");
    if (fileInput.files.length > 0) {
      const filePath = fileInput.files[0].path; // CSVファイルのパスを取得
      window.api.importCsv(filePath); // Electronのメインプロセスに送信
    } else {
      alert("Please select a CSV file!");
    }
  });
}

// インポート結果のメッセージ受信
function setupImportStatusReceiver() {
  window.api.onImportStatus((message) => {
    document.getElementById("statusMessage").innerText = message; // メッセージをHTMLに表示
  });
}

// データの取得処理
function setupDataFetch() {
  const fetchDataButton = document.getElementById("fetchDataButton");
  fetchDataButton.addEventListener("click", () => {
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

// 初期化処理
function initialize() {
  setupCsvImport();
  setupImportStatusReceiver();
  setupDataFetch();
  setupDatabaseDataReceiver();
}

// ページをロード後に初期化
document.addEventListener("DOMContentLoaded", initialize);
