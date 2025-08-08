const targetDeviceName = "HYDeAir";

document.getElementById("start-scan").addEventListener("click", async () => {
  try {
    console.log("Scanning for BLE devices...");

    const device = await navigator.bluetooth.requestDevice({
      //acceptAllDevices: true, // 全てのデバイスを受け入れる
      filters: [{ name: targetDeviceName }],
    });

    console.log(`Selected device: ${device.name}`);

    // アドバタイズ情報を監視するイベントの設定
    device.addEventListener("advertisementreceived", (event) => {
      const { name, rssi, txPower } = event;
      console.log(
        `Advertisement from: ${name} | RSSI: ${rssi} | TxPower: ${txPower}`
      );
    });

    // アドバタイズ監視を開始
    await device.watchAdvertisements();
    console.log("Started watching advertisements for the device.");
  } catch (error) {
    if (error.name === "NotFoundError") {
      alert("デバイスが選択されませんでした。もう一度試してください。");
    } else {
      console.error("エラーが発生しました:", error);
    }
  }
});
