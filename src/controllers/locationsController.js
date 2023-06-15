const { findNearestMarkers } = require("./mapController");

const DataDUTCenter = require("../Data/dutCenterData");

const handleTemperature = (dataset) => {
  const newArray = [];
  for (let i = 0; i < dataset.length; i++) {
    const object = dataset[i];
    const temperatureSet = object.value.temperature;
    const lastTemperatureValue = temperatureSet[temperatureSet.length - 1];

    const distance = object.distance;
    const newObj = {
      temperature: lastTemperatureValue,
      distance: distance,
    };
    newArray.push(newObj);
  }
  return newArray;
};

const handleHumidity = (dataset) => {
  const newArray = [];
  for (let i = 0; i < dataset.length; i++) {
    const object = dataset[i];
    const humiditySet = object.value.humidity;
    const lastHumidityValue = humiditySet[humiditySet.length - 1];

    const distance = object.distance;
    const newObj = {
      humidity: lastHumidityValue,
      distance: distance,
    };
    newArray.push(newObj);
  }
  return newArray;
};

const handlePM25 = (dataset) => {
  const newArray = [];
  for (let i = 0; i < dataset.length; i++) {
    const object = dataset[i];
    const pm25Set = object.value.pm25;
    const lastPm25Value = pm25Set[pm25Set.length - 1];

    const distance = object.distance;
    const newObj = {
      pm25: lastPm25Value,
      distance: distance,
    };
    newArray.push(newObj);
  }
  return newArray;
};

const handlePM10 = (dataset) => {
  const newArray = [];
  for (let i = 0; i < dataset.length; i++) {
    const object = dataset[i];
    const pm10Set = object.value.pm10;
    const lastPm10Value = pm10Set[pm10Set.length - 1];

    const distance = object.distance;
    const newObj = {
      pm10: lastPm10Value,
      distance: distance,
    };
    newArray.push(newObj);
  }
  return newArray;
};

const handleCO = (dataset) => {
  const newArray = [];
  for (let i = 0; i < dataset.length; i++) {
    const object = dataset[i];
    const COSet = object.value.CO;
    const lastCOValue = COSet[COSet.length - 1];

    const distance = object.distance;
    const newObj = {
      CO: lastCOValue,
      distance: distance,
    };
    newArray.push(newObj);
  }
  return newArray;
};

const handlePoisonGas = (dataset) => {
  const newArray = [];
  for (let i = 0; i < dataset.length; i++) {
    const object = dataset[i];
    const poisonGasSet = object.value.poisonGas;
    const lastpoisonGasValue = poisonGasSet[poisonGasSet.length - 1];

    const distance = object.distance;
    const newObj = {
      poisonGas: lastpoisonGasValue,
      distance: distance,
    };
    newArray.push(newObj);
  }
  return newArray;
};

const interpolation = (markers, lat, lng) => {
  const dataFromNearests = findNearestMarkers(markers, lat, lng);

  const temperatureValues = handleTemperature(dataFromNearests);
  const humidityValues = handleHumidity(dataFromNearests);
  const pm25Values = handlePM25(dataFromNearests);
  const pm10Values = handlePM10(dataFromNearests);
  const COValues = handleCO(dataFromNearests);
  const poisonGasValues = handlePoisonGas(dataFromNearests);
  const interpolationTemperature = Math.round(
    (temperatureValues[0].temperature.value / temperatureValues[0].distance +
      temperatureValues[1].temperature.value / temperatureValues[1].distance +
      temperatureValues[2].temperature.value / temperatureValues[2].distance) /
      (1 / temperatureValues[2].distance +
        1 / temperatureValues[1].distance +
        1 / temperatureValues[0].distance)
  );
  const interpolationHumidity = Math.round(
    (humidityValues[0].humidity.value / humidityValues[0].distance +
      humidityValues[1].humidity.value / humidityValues[1].distance +
      humidityValues[2].humidity.value / humidityValues[2].distance) /
      (1 / humidityValues[2].distance +
        1 / humidityValues[1].distance +
        1 / humidityValues[0].distance)
  );
  const interpolationPM25 = Math.round(
    (pm25Values[0].pm25.value / pm25Values[0].distance +
      pm25Values[1].pm25.value / pm25Values[1].distance +
      pm25Values[2].pm25.value / pm25Values[2].distance) /
      (1 / pm25Values[2].distance +
        1 / pm25Values[1].distance +
        1 / pm25Values[0].distance)
  );
  const interpolationPM10 = Math.round(
    (pm10Values[0].pm10.value / pm10Values[0].distance +
      pm10Values[1].pm10.value / pm10Values[1].distance +
      pm10Values[2].pm10.value / pm10Values[2].distance) /
      (1 / pm10Values[2].distance +
        1 / pm10Values[1].distance +
        1 / pm10Values[0].distance)
  );
  const interpolationCO = Math.round(
    (COValues[0].CO.value / COValues[0].distance +
      COValues[1].CO.value / COValues[1].distance +
      COValues[2].CO.value / COValues[2].distance) /
      (1 / COValues[2].distance +
        1 / COValues[1].distance +
        1 / COValues[0].distance)
  );
  const interpolationPoisonGas = Math.round(
    (poisonGasValues[0].poisonGas.value / poisonGasValues[0].distance +
      poisonGasValues[1].poisonGas.value / poisonGasValues[1].distance +
      poisonGasValues[2].poisonGas.value / poisonGasValues[2].distance) /
      (1 / poisonGasValues[2].distance +
        1 / poisonGasValues[1].distance +
        1 / poisonGasValues[0].distance)
  );

  return {
    interpolationTemperature,
    interpolationHumidity,
    interpolationPM25,
    interpolationPM10,
    interpolationCO,
    interpolationPoisonGas,
  };
};

module.exports = { interpolation };
