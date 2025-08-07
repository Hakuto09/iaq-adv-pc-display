document.getElementById("start-scan").addEventListener("click", async () => {
  try {
    console.log("Scanning for BLE devices...");

    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true, // 全てのデバイスを受け入れる
      //                    optionalServices: []   // 必要ならサービスUUIDを指定
    });

    console.log("Connected to", device.name || "Unknown Device");
    const advDataContainer = document.getElementById("devices");
    const listItem = document.createElement("li");

    listItem.textContent = `Device: ${device.name || "Unnamed"} | ID: ${
      device.id
    }`;
    advDataContainer.appendChild(listItem);
  } catch (error) {
    if (error.name === "NotFoundError") {
      alert("デバイスが選択されませんでした。もう一度試してください。");
    } else {
      console.error("エラーが発生しました:", error);
    }
  }
});
