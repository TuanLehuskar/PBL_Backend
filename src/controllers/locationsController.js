const { findNearestMarkers } = require("./mapController");

const handleField = (dataset, name) => {
  const newArray = dataset.map((item) => {
    const fieldValue = item.value[name];
    const convertedValue = isNaN(fieldValue) ? fieldValue : Number(fieldValue);

    return {
      [name]: convertedValue,
      distance: item.distance,
    };
  });

  return newArray;
};

const interpolation = (markers, lat, lng, lastDocument) => {
  const dataFromNearests = findNearestMarkers(markers, lat, lng, lastDocument);
  const temperatureValues = handleField(dataFromNearests, "temperature");
  const humidityValues = handleField(dataFromNearests, "humidity");
  const pm25Values = handleField(dataFromNearests, "pm25");
  const pm10Values = handleField(dataFromNearests, "pm10");
  const COValues = handleField(dataFromNearests, "CO");
  const poisonGasValues = handleField(dataFromNearests, "poisonGas");
  const interpolationTemperature = Math.round(
    (temperatureValues[0].temperature / temperatureValues[0].distance +
      temperatureValues[1].temperature / temperatureValues[1].distance +
      temperatureValues[2].temperature / temperatureValues[2].distance) /
      (1 / temperatureValues[2].distance +
        1 / temperatureValues[1].distance +
        1 / temperatureValues[0].distance)
  );
  const interpolationHumidity = Math.round(
    (humidityValues[0].humidity / humidityValues[0].distance +
      humidityValues[1].humidity / humidityValues[1].distance +
      humidityValues[2].humidity / humidityValues[2].distance) /
      (1 / humidityValues[2].distance +
        1 / humidityValues[1].distance +
        1 / humidityValues[0].distance)
  );
  const interpolationPM25 = Math.round(
    (pm25Values[0].pm25 / pm25Values[0].distance +
      pm25Values[1].pm25 / pm25Values[1].distance +
      pm25Values[2].pm25 / pm25Values[2].distance) /
      (1 / pm25Values[2].distance +
        1 / pm25Values[1].distance +
        1 / pm25Values[0].distance)
  );
  const interpolationPM10 = Math.round(
    (pm10Values[0].pm10 / pm10Values[0].distance +
      pm10Values[1].pm10 / pm10Values[1].distance +
      pm10Values[2].pm10 / pm10Values[2].distance) /
      (1 / pm10Values[2].distance +
        1 / pm10Values[1].distance +
        1 / pm10Values[0].distance)
  );
  const interpolationCO = Math.round(
    (COValues[0].CO / COValues[0].distance +
      COValues[1].CO / COValues[1].distance +
      COValues[2].CO / COValues[2].distance) /
      (1 / COValues[2].distance +
        1 / COValues[1].distance +
        1 / COValues[0].distance)
  );
  const interpolationPoisonGas = Math.round(
    (poisonGasValues[0].poisonGas / poisonGasValues[0].distance +
      poisonGasValues[1].poisonGas / poisonGasValues[1].distance +
      poisonGasValues[2].poisonGas / poisonGasValues[2].distance) /
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
