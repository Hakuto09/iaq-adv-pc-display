export function calcTemperatureFrom16Bit(temperature16Bit) {
  const min16Bit = 0xff38; // -20.0 ℃
  const max16Bit = 0x01f4; // 50.0 ℃
  const minTemperature = -20.0; // ℃
  const maxTemperature = 50.0; // ℃

  const temperature = (
    ((temperature16Bit - min16Bit) / (max16Bit - min16Bit)) *
      (maxTemperature - minTemperature) +
    minTemperature
  ).toFixed(1);

  console.log(
    `calcTemperatureFrom16Bit(): temperature16Bit ${temperature16Bit}`
  );
  console.log(`calcTemperatureFrom16Bit(): temperature ${temperature} ℃`);

  return temperature;
}

export function calcHumidityFrom16Bit(humidity16Bit) {
  const min16Bit = 0x0000; // 0.0 %RH
  const max16Bit = 0x03e8; // 100.0 %RH
  const minHumidity = 0.0; // %RH
  const maxHumidity = 100.0; // %RH

  const humidity = (
    ((humidity16Bit - min16Bit) / (max16Bit - min16Bit)) *
      (maxHumidity - minHumidity) +
    minHumidity
  ).toFixed(1);

  console.log(`calcHumidityFrom16Bit(): humidity16Bit ${humidity16Bit}`);
  console.log(`calcHumidityFrom16Bit(): humidity ${humidity} %RH`);

  return humidity;
}

export function calcPm1_0From16Bit(pm1_0_16Bit) {
  const min16Bit = 0x0000; // 0 ug/m3
  const max16Bit = 0x03e8; // 1000 ug/m3
  const minPm1_0 = 0; // ug/m3
  const maxPm1_0 = 1000; // ug/m3

  const pm1_0 = (
    ((pm1_0_16Bit - min16Bit) / (max16Bit - min16Bit)) * (maxPm1_0 - minPm1_0) +
    minPm1_0
  ).toFixed(0);

  console.log(`calcPm1_0From16Bit(): pm1_0_16Bit ${pm1_0_16Bit}`);
  console.log(`calcPm1_0From16Bit(): pm1_0 ${pm1_0} %RH`);

  return pm1_0;
}

export function calcPm2_5From16Bit(pm2_5_16Bit) {
  const min16Bit = 0x0000; // 0 ug/m3
  const max16Bit = 0x03e8; // 1000 ug/m3
  const minPm2_5 = 0; // ug/m3
  const maxPm2_5 = 1000; // ug/m3

  const pm2_5 = (
    ((pm2_5_16Bit - min16Bit) / (max16Bit - min16Bit)) * (maxPm2_5 - minPm2_5) +
    minPm2_5
  ).toFixed(0);

  console.log(`calcPm2_5From16Bit(): pm1_0_16Bit ${pm2_5_16Bit}`);
  console.log(`calcPm2_5From16Bit(): pm1_0 ${pm2_5} ug/m3`);

  return pm2_5;
}

export function calcPm10From16Bit(pm10_16Bit) {
  const min16Bit = 0x0000; // 0 ug/m3
  const max16Bit = 0x03e8; // 1000 ug/m3
  const minPm10 = 0; // ug/m3
  const maxPm10 = 1000; // ug/m3

  const pm10 = (
    ((pm10_16Bit - min16Bit) / (max16Bit - min16Bit)) * (maxPm10 - minPm10) +
    minPm10
  ).toFixed(0);

  console.log(`calcPm10From16Bit(): pm10_16Bit ${pm10_16Bit}`);
  console.log(`calcPm10From16Bit(): pm10 ${pm10} ug/m3`);

  return pm10;
}

export function calcCO2From16Bit(co2_16Bit) {
  const min16Bit = 0x0190; // 400 ppm
  const max16Bit = 0x1388; // 5000 ppm
  const minCO2 = 400; // ppm
  const maxCO2 = 5000; // ppm

  const co2 = (
    ((co2_16Bit - min16Bit) / (max16Bit - min16Bit)) * (maxCO2 - minCO2) +
    minCO2
  ).toFixed(0);

  console.log(`calcCO2From16Bit(): co2_16Bit ${co2_16Bit}`);
  console.log(`calcCO2From16Bit(): co2 ${co2} ppm`);

  return co2;
}

export function calcTVOCFrom16Bit(tvoc16Bit) {
  const min16Bit = 0x0000; // 4 ppb
  const max16Bit = 0x07d0; // 2000 ppb
  const minTVOC = 0; // ppb
  const maxTVOC = 2000; // ppb

  const tvoc = (
    ((tvoc16Bit - min16Bit) / (max16Bit - min16Bit)) * (maxTVOC - minTVOC) +
    minTVOC
  ).toFixed(0);

  console.log(`calcCO2From16Bit(): tvoc16Bit ${tvoc16Bit}`);
  console.log(`calcCO2From16Bit(): tvoc ${tvoc} ppm`);

  return tvoc;
}

export function calcCH2OFrom16Bit(ch2o_16Bit) {
  const min16Bit = 0x0000; // 4 ppb
  const max16Bit = 0x1388; // 5000 ppb
  const minCH2O = 0; // ppb
  const maxCH2O = 5000; // ppb

  const ch2o = (
    ((ch2o_16Bit - min16Bit) / (max16Bit - min16Bit)) * (maxCH2O - minCH2O) +
    minCH2O
  ).toFixed(0);

  console.log(`calcCO2From16Bit(): CH2O_16Bit ${ch2o_16Bit}`);
  console.log(`calcCO2From16Bit(): ch2o ${ch2o} ppm`);

  return ch2o;
}

export function calcCOFrom8Bit(co_8Bit) {
  const min8Bit = 0x00; // 0.0 ppm
  const max8Bit = 0xc8; // 20.0 ppm
  const minCO = 0.0; // 0.0 ppm
  const maxCO = 20.0; // 20.0 ppm

  const co = (
    ((co_8Bit - min8Bit) / (max8Bit - min8Bit)) * (maxCO - minCO) +
    minCO
  ).toFixed(1);

  console.log(`calcCO2From16Bit(): co_8Bit ${co_8Bit}`);
  console.log(`calcCO2From16Bit(): co ${co} ppm`);

  return co;
}

export function getIAQData(manufacturerData) {
  const sendData = {
    temperature: 0,
    humidity: 0,
    co2: 0,
    tvoc: 0,
    co: 0,
    pm1_0: 0,
    pm2_5: 0,
    pm10: 0,
    ch2o: 0,
  };

  sendData.temperature = calcTemperatureFrom16Bit(
    (manufacturerData[0] << 8) | manufacturerData[1]
  );
  sendData.humidity = calcHumidityFrom16Bit(
    (manufacturerData[2] << 8) | manufacturerData[3]
  );
  sendData.pm1_0 = calcPm1_0From16Bit(
    (manufacturerData[4] << 8) | manufacturerData[5]
  );
  sendData.pm2_5 = calcPm2_5From16Bit(
    (manufacturerData[6] << 8) | manufacturerData[7]
  );
  sendData.pm10 = calcPm10From16Bit(
    (manufacturerData[8] << 8) | manufacturerData[9]
  );
  sendData.co2 = calcCO2From16Bit(
    (manufacturerData[10] << 8) | manufacturerData[11]
  );
  sendData.tvoc = calcTVOCFrom16Bit(
    (manufacturerData[12] << 8) | manufacturerData[13]
  );
  sendData.ch2o = calcCH2OFrom16Bit(
    (manufacturerData[14] << 8) | manufacturerData[15]
  );
  sendData.co = calcCOFrom8Bit(manufacturerData[16]);

  return sendData;
}
