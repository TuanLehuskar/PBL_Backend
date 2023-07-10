const fs = require("fs");
const mongoose = require("mongoose");
const Data = require("../models/dataModel");

const handleTimeData = (data) => {
  const createdAt = new Date(data.created_at);
  const time = createdAt.toTimeString().slice(0, 8);
  const date = createdAt.toISOString().slice(0, 10);

  return {
    ...data,
    time: time,
    date: date,
  };
};

const separateDataByField = (data, field) => {
  const separatedData = [];

  data.feeds.forEach((item) => {
    const separatedItem = {
      time: item.time,
      date: item.date,
      field: item[field],
    };

    separatedData.push(separatedItem);
  });

  return separatedData;
};
const handleJSONValue = (data) => {
  const date = new Date(data.created_at);
  const utcTime = date.getTime();
  const localTime = new Date(utcTime + 7 * 3600000); // Thêm mốc múi giờ +07:00
  const formattedData = {
    timeStamp: localTime,
    temperature: data.field1 !== null ? parseFloat(data.field1) : 30,
    humidity: data.field2 !== null ? parseFloat(data.field2) : 70,
    pm25: data.field3 !== null ? parseFloat(data.field3) : 20,
    pm10: data.field4 !== null ? parseFloat(data.field4) : 100,
    CO: data.field5 !== null ? parseFloat(data.field5) : 50,
    poisonGas: data.field6 !== null ? parseFloat(data.field6) : 100,
  };

  return formattedData;
};

const randomMultiplier = () => {
  return Math.random() * 0.1 + 0.9;
};
const randomMultiplier2 = () => {
  return Math.random() * 0.15 + 0.95;
};
const randomMultiplier3 = () => {
  return Math.random() * 0.2 + 0.9;
};
const randomMultiplier4 = () => {
  return Math.random() * 0.15 + 0.85;
};

const handleDataDiagram = (data) => {
  const convertedData = {
    temperature: [],
    humidity: [],
    pm25: [],
    pm10: [],
    CO: [],
    poisonGas: [],
  };

  data.forEach((item) => {
    const date = new Date(item.created_at);
    const utcTime = date.getTime();
    const localTime = new Date(utcTime);
    // const localTime = new Date(utcTime + 7 * 3600000); // Thêm mốc múi giờ +07:00

    const temperatureObj = {
      timeStamp: localTime,
      value: parseFloat(item.field1) || 0,
    };
    const humidityObj = {
      timeStamp: localTime,
      value: parseFloat(item.field2) || 0,
    };
    const pm25Obj = {
      timeStamp: localTime,
      value: parseFloat(item.field3) || 0,
    };
    const pm10Obj = {
      timeStamp: localTime,
      value: parseFloat(item.field4) || 0,
    };
    const COObj = {
      timeStamp: localTime,
      value: parseFloat(item.field5) || 0,
    };
    const poisonGasObj = {
      timeStamp: localTime,
      value: parseFloat(item.field6) || 0,
    };

    convertedData.temperature.push(temperatureObj);
    convertedData.humidity.push(humidityObj);
    convertedData.pm25.push(pm25Obj);
    convertedData.pm10.push(pm10Obj);
    convertedData.CO.push(COObj);
    convertedData.poisonGas.push(poisonGasObj);
  });

  return convertedData;
};

const handleLastValue = (data) => {
  const result = {};
  for (let field in data) {
    const values = data[field];
    const lastObject = values[values.length - 1];
    const lastValue = lastObject.value;
    result[field] = lastValue;
  }
  return result;
};

const warningCheck = (data) => {
  const filteredData = {
    pm25: data.pm25
      .filter((obj) => obj.value >= 36)
      .map((obj) => ({ timeStamp: obj.timeStamp, value: obj.value })),
    pm10: data.pm10
      .filter((obj) => obj.value >= 155)
      .map((obj) => ({ timeStamp: obj.timeStamp, value: obj.value })),
    CO: data.CO.filter((obj) => obj.value >= 100).map((obj) => ({
      timeStamp: obj.timeStamp,
      value: obj.value,
    })),
    poisonGas: data.poisonGas
      .filter((obj) => obj.value >= 50)
      .map((obj) => ({ timeStamp: obj.timeStamp, value: obj.value })),
  };

  return filteredData;
};

const multiplierLastValue = (data) => {
  const result = {};
  let isFirstField = true; // Biến kiểm tra xem field hiện tại có phải là field đầu tiên hay không

  for (let field in data) {
    if (isFirstField) {
      result[field] = data[field];
      isFirstField = false;
    } else {
      const value = Math.round(data[field] * randomMultiplier());
      result[field] = value;
    }
  }

  return result;
};
const multiplyValuesWithRandom = (data) => {
  const modifiedData = { ...data };

  for (let field in modifiedData) {
    const fieldArray = modifiedData[field];
    if (Array.isArray(fieldArray)) {
      modifiedData[field] = fieldArray.map((obj) => {
        if (obj && obj.hasOwnProperty("value")) {
          const randomMultiplier = Math.random() * 0.2 + 0.9; // Sinh số ngẫu nhiên từ 0.9 đến 1.1
          const modifiedValue = Math.round(obj.value * randomMultiplier);
          return { ...obj, value: modifiedValue };
        }
        return obj;
      });
    }
  }

  return modifiedData;
};

module.exports = {
  handleTimeData,
  separateDataByField,
  handleDataDiagram,
  randomMultiplier,
  randomMultiplier2,
  randomMultiplier3,
  randomMultiplier4,
  handleLastValue,
  multiplierLastValue,
  handleJSONValue,
  warningCheck,
  multiplyValuesWithRandom,
};
