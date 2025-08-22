function signed16Bit(value) {
  // 値が16ビット範囲内かを確認
  // 16ビットの符号付き整数範囲を補正
  return value & 0x8000 ? value - 0x10000 : value;
}

function checkError16Bit(value, min, max) {
  const minError =
    value & 0x8000
      ? min & 0x8000
        ? value > min // value=minus & min=minus
        : true // value=minus & min=plus
      : min & 0x8000
      ? false // value=plus & min=minus
      : value < min; // value=plus & min=plus
  const maxError =
    value & 0x8000
      ? max & 0x8000
        ? value < max // value=minus & max=minus
        : false // value=minus & max=plus
      : max & 0x8000
      ? true // value=plus & max=minus
      : value > max; // value=plus & max=plus

  console.log("checkError16Bit(): minError ", minError, " maxError ", maxError);
  return minError | maxError;
}

export function calcTemperatureFrom16Bit(temperature16Bit) {
  const min16Bit = 0xff38; // -20.0 ℃
  const max16Bit = 0x01f4; // 50.0 ℃
  const signedMin16Bit = signed16Bit(min16Bit);
  const signedMax16Bit = signed16Bit(max16Bit);
  const minTemperature = -20.0; // ℃
  const maxTemperature = 50.0; // ℃
  const signedTemperature16Bit = signed16Bit(temperature16Bit);
  const error = checkError16Bit(temperature16Bit, min16Bit, max16Bit);

  const temperature = (
    ((signedTemperature16Bit - signedMin16Bit) /
      (signedMax16Bit - signedMin16Bit)) *
      (maxTemperature - minTemperature) +
    minTemperature
  ).toFixed(1);

  console.log(
    `calcTemperatureFrom16Bit(): temperature16Bit ${temperature16Bit}`
  );
  console.log(`calcTemperatureFrom16Bit(): temperature ${temperature} C`);
  console.log(`calcTemperatureFrom16Bit(): error ${error}`);

  return [temperature, error];
}

export function calcHumidityFrom16Bit(humidity16Bit) {
  const min16Bit = 0x0000; // 0.0 %RH
  const max16Bit = 0x03e8; // 100.0 %RH
  const signedMin16Bit = signed16Bit(min16Bit);
  const signedMax16Bit = signed16Bit(max16Bit);
  const minHumidity = 0.0; // %RH
  const maxHumidity = 100.0; // %RH
  const signedHumidity16Bit = signed16Bit(humidity16Bit);
  const error = checkError16Bit(humidity16Bit, min16Bit, max16Bit);

  const humidity = (
    ((signedHumidity16Bit - signedMin16Bit) /
      (signedMax16Bit - signedMin16Bit)) *
      (maxHumidity - minHumidity) +
    minHumidity
  ).toFixed(1);

  console.log(`calcHumidityFrom16Bit(): humidity16Bit ${humidity16Bit}`);
  console.log(`calcHumidityFrom16Bit(): humidity ${humidity} %RH`);
  console.log(`calcHumidityFrom16Bit(): error ${error}`);

  return [humidity, error];
}

export function calcPm1_0From16Bit(pm1_0_16Bit) {
  const min16Bit = 0x0000; // 0 ug/m3
  const max16Bit = 0x03e8; // 1000 ug/m3
  const signedMin16Bit = signed16Bit(min16Bit);
  const signedMax16Bit = signed16Bit(max16Bit);
  const minPm1_0 = 0; // ug/m3
  const maxPm1_0 = 1000; // ug/m3
  const signedPm1_0_16Bit = signed16Bit(pm1_0_16Bit);
  const error = checkError16Bit(pm1_0_16Bit, min16Bit, max16Bit);

  const pm1_0 = (
    ((signedPm1_0_16Bit - signedMin16Bit) / (signedMax16Bit - signedMin16Bit)) *
      (maxPm1_0 - minPm1_0) +
    minPm1_0
  ).toFixed(0);

  console.log(`calcPm1_0From16Bit(): pm1_0_16Bit ${pm1_0_16Bit}`);
  console.log(`calcPm1_0From16Bit(): pm1_0 ${pm1_0} %RH`);
  console.log(`calcPm1_0From16Bit(): error ${error}`);

  return [pm1_0, error];
}

export function calcPm2_5From16Bit(pm2_5_16Bit) {
  const min16Bit = 0x0000; // 0 ug/m3
  const max16Bit = 0x03e8; // 1000 ug/m3
  const signedMin16Bit = signed16Bit(min16Bit);
  const signedMax16Bit = signed16Bit(max16Bit);
  const minPm2_5 = 0; // ug/m3
  const maxPm2_5 = 1000; // ug/m3
  const signedPm2_5_16Bit = signed16Bit(pm2_5_16Bit);
  const error = checkError16Bit(pm2_5_16Bit, min16Bit, max16Bit);

  const pm2_5 = (
    ((signedPm2_5_16Bit - signedMin16Bit) / (signedMax16Bit - signedMin16Bit)) *
      (maxPm2_5 - minPm2_5) +
    minPm2_5
  ).toFixed(0);

  console.log(`calcPm2_5From16Bit(): pm1_0_16Bit ${pm2_5_16Bit}`);
  console.log(`calcPm2_5From16Bit(): pm1_0 ${pm2_5} ug/m3`);
  console.log(`calcPm2_5From16Bit(): error ${error}`);

  return [pm2_5, error];
}

export function calcPm10From16Bit(pm10_16Bit) {
  const min16Bit = 0x0000; // 0 ug/m3
  const max16Bit = 0x03e8; // 1000 ug/m3
  const signedMin16Bit = signed16Bit(min16Bit);
  const signedMax16Bit = signed16Bit(max16Bit);
  const minPm10 = 0; // ug/m3
  const maxPm10 = 1000; // ug/m3
  const signedPm10_16Bit = signed16Bit(pm10_16Bit);
  const error = checkError16Bit(pm10_16Bit, min16Bit, max16Bit);

  const pm10 = (
    ((signedPm10_16Bit - signedMin16Bit) / (signedMax16Bit - signedMin16Bit)) *
      (maxPm10 - minPm10) +
    minPm10
  ).toFixed(0);

  console.log(`calcPm10From16Bit(): pm10_16Bit ${pm10_16Bit}`);
  console.log(`calcPm10From16Bit(): pm10 ${pm10} ug/m3`);
  console.log(`calcPm10From16Bit(): error ${error}`);

  return [pm10, error];
}

export function calcCO2From16Bit(co2_16Bit) {
  const min16Bit = 0x0190; // 400 ppm
  const max16Bit = 0x1388; // 5000 ppm
  const signedMin16Bit = signed16Bit(min16Bit);
  const signedMax16Bit = signed16Bit(max16Bit);
  const minCO2 = 400; // ppm
  const maxCO2 = 5000; // ppm
  const signedCO2_16Bit = signed16Bit(co2_16Bit);
  const error = checkError16Bit(co2_16Bit, min16Bit, max16Bit);

  const co2 = (
    ((signedCO2_16Bit - signedMin16Bit) / (signedMax16Bit - signedMin16Bit)) *
      (maxCO2 - minCO2) +
    minCO2
  ).toFixed(0);

  console.log(`calcCO2From16Bit(): co2_16Bit ${co2_16Bit}`);
  console.log(`calcCO2From16Bit(): co2 ${co2} ppm`);
  console.log(`calcCO2From16Bit(): error ${error}`);

  return [co2, error];
}

export function calcTVOCFrom16Bit(tvoc16Bit) {
  const min16Bit = 0x0000; // 4 ppb
  const max16Bit = 0x07d0; // 2000 ppb
  const signedMin16Bit = signed16Bit(min16Bit);
  const signedMax16Bit = signed16Bit(max16Bit);
  const minTVOC = 0; // ppb
  const maxTVOC = 2000; // ppb
  const signedTVOC16Bit = signed16Bit(tvoc16Bit);
  const error = checkError16Bit(tvoc16Bit, min16Bit, max16Bit);

  const tvoc = (
    ((signedTVOC16Bit - signedMin16Bit) / (signedMax16Bit - signedMin16Bit)) *
      (maxTVOC - minTVOC) +
    minTVOC
  ).toFixed(0);

  console.log(`calcTVOCFrom16Bit(): tvoc16Bit ${tvoc16Bit}`);
  console.log(`calcTVOCFrom16Bit(): tvoc ${tvoc} ppm`);
  console.log(`calcTVOCFrom16Bit(): error ${error}`);

  return [tvoc, error];
}

export function calcCH2OFrom16Bit(ch2o_16Bit) {
  const min16Bit = 0x0000; // 0 ppb
  const max16Bit = 0x1388; // 5000 ppb
  const signedMin16Bit = signed16Bit(min16Bit);
  const signedMax16Bit = signed16Bit(max16Bit);
  const minCH2O = 0; // ppb
  const maxCH2O = 5000; // ppb
  const signedCH2O_16Bit = signed16Bit(ch2o_16Bit);
  const error = checkError16Bit(ch2o_16Bit, min16Bit, max16Bit);

  const ch2o = (
    ((signedCH2O_16Bit - signedMin16Bit) / (signedMax16Bit - signedMin16Bit)) *
      (maxCH2O - minCH2O) +
    minCH2O
  ).toFixed(0);

  console.log(`calcCH2OFrom16Bit(): CH2O_16Bit ${ch2o_16Bit}`);
  console.log(`calcCH2OFrom16Bit(): ch2o ${ch2o} ppm`);
  console.log(`calcCH2OFrom16Bit(): error ${error}`);

  return [ch2o, error];
}

export function calcCOFrom8Bit(co_8Bit) {
  const signedMin8Bit = 0x00; // 0.0 ppm
  const signedMax8Bit = 0xc8; // 20.0 ppm
  const minCO = 0.0; // ppm
  const maxCO = 20.0; // ppm
  const signedCO_8Bit = co_8Bit;
  const error = co_8Bit > signedMax8Bit;

  const co = (
    ((signedCO_8Bit - signedMin8Bit) / (signedMax8Bit - signedMin8Bit)) *
      (maxCO - minCO) +
    minCO
  ).toFixed(1);

  console.log(`calcCOFrom8Bit(): co_8Bit ${co_8Bit}`);
  console.log(`calcCOFrom8Bit(): co ${co} ppm`);
  console.log(`calcCOFrom8Bit(): error ${error}`);

  return [co, error];
}

export function getIAQData(manufacturerData) {
  const IAQData = {
    temperature: 0,
    humidity: 0,
    co2: 0,
    tvoc: 0,
    co: 0,
    pm1_0: 0,
    pm2_5: 0,
    pm10: 0,
    ch2o: 0,
    error: false,
  };
  let error;

  if (manufacturerData[0] === "undefined") {
    console.log('manufacturerData[0] === "undefined": In');
    IAQData.error = true;
  }

  [IAQData.temperature, error] = calcTemperatureFrom16Bit(
    (manufacturerData[0] << 8) | manufacturerData[1]
  );
  IAQData.error |= error;

  [IAQData.humidity, error] = calcHumidityFrom16Bit(
    (manufacturerData[2] << 8) | manufacturerData[3]
  );
  IAQData.error |= error;

  [IAQData.pm1_0, error] = calcPm1_0From16Bit(
    (manufacturerData[4] << 8) | manufacturerData[5]
  );
  IAQData.error |= error;

  [IAQData.pm2_5, error] = calcPm2_5From16Bit(
    (manufacturerData[6] << 8) | manufacturerData[7]
  );
  IAQData.error |= error;

  [IAQData.pm10, error] = calcPm10From16Bit(
    (manufacturerData[8] << 8) | manufacturerData[9]
  );
  IAQData.error |= error;

  [IAQData.co2, error] = calcCO2From16Bit(
    (manufacturerData[10] << 8) | manufacturerData[11]
  );
  IAQData.error |= error;

  [IAQData.tvoc, error] = calcTVOCFrom16Bit(
    (manufacturerData[12] << 8) | manufacturerData[13]
  );
  IAQData.error |= error;

  [IAQData.ch2o, error] = calcCH2OFrom16Bit(
    (manufacturerData[14] << 8) | manufacturerData[15]
  );
  IAQData.error |= error;

  [IAQData.co, error] = calcCOFrom8Bit(manufacturerData[16]);
  IAQData.error |= error;

  return IAQData;
}
