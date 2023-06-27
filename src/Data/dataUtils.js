const { getDataFromAPI } = require("./apiService");
const path = require("path");
const { inspect } = require("util");
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
  const formattedData = {
    temperature: data.field1 !== null ? parseFloat(data.field1) : 30,
    humidity: data.field2 !== null ? parseFloat(data.field2) : 70,
    pm25: data.field3 !== null ? parseFloat(data.field3) : 20,
    pm10: data.field4 !== null ? parseFloat(data.field4) : 100,
    CO: data.field5 !== null ? parseFloat(data.field5) : 50,
    poisonGas: data.field6 !== null ? parseFloat(data.field6) : 100,
  };

  return formattedData;
};

// const updateDataPeriodically = () => {
//   setInterval(async () => {
//     try {
//       const response = await getDataFromAPI(
//         "https://thingspeak.com/channels/2099351/feed.json"
//       );
//       const data = response;

//       // Xử lý dữ liệu JSON
//       const processedData = handleTimeData(data);
//       const formattedData = {
//         temperature: processedData.feeds.map((feed) => ({
//           date: feed.date,
//           time: feed.time,
//           value: feed.field1 !== null ? parseFloat(feed.field1) : 30,
//         })),
//         humidity: processedData.feeds.map((feed) => ({
//           date: feed.date,
//           time: feed.time,
//           value: feed.field2 !== null ? parseFloat(feed.field2) : 70,
//         })),
//         pm25: processedData.feeds.map((feed) => ({
//           date: feed.date,
//           time: feed.time,
//           value: feed.field3 !== null ? parseFloat(feed.field3) : 160,
//         })),
//         pm10: processedData.feeds.map((feed) => ({
//           date: feed.date,
//           time: feed.time,
//           value: feed.field4 !== null ? parseFloat(feed.field4) : 170,
//         })),
//         CO: processedData.feeds.map((feed) => ({
//           date: feed.date,
//           time: feed.time,
//           value: feed.field5 !== null ? parseFloat(feed.field5) : 170,
//         })),
//         poisonGas: processedData.feeds.map((feed) => ({
//           date: feed.date,
//           time: feed.time,
//           value: feed.field6 !== null ? parseFloat(feed.field6) : 180,
//         })),
//         lat: processedData.feeds.map((feed) => ({
//           date: feed.date,
//           time: feed.time,
//           value: feed.field7 !== null ? parseFloat(feed.field7) : 160,
//         })),
//         lng: processedData.feeds.map((feed) => ({
//           date: feed.date,
//           time: feed.time,
//           value: feed.field8 !== null ? parseFloat(feed.field8) : 108,
//         })),
//       };

//       const filePaths = [
//         path.join(__dirname, "/", "dut1Data.js"),
//         path.join(__dirname, "/", "dut2Data.js"),
//         path.join(__dirname, "/", "dut3Data.js"),
//         path.join(__dirname, "/", "dutCenterData.js"),
//       ];

//       filePaths.forEach((filePath, index) => {
//         const objectString = inspect(formattedData, { depth: null });
//         let fileContent = `const data = ${objectString};\n\nmodule.exports = data;`;

//         if (index !== 0) {
//           fileContent = fileContent.replace(
//             /value: (\d+(\.\d+)?)/g,
//             `value: Math.round($1 * ${randomMultiplier()})`
//           );
//         }

//         fs.writeFile(filePath, fileContent, (err) => {
//           if (err) {
//             console.error(err);
//           } else {
//             console.log(`Dữ liệu đã được ghi vào file ${filePath}`);
//           }
//         });
//       });
//     } catch (error) {
//       console.error(error);
//     }
//   }, 15000); //
// };
const randomMultiplier = () => {
  return Math.random() * 0.1 + 0.9;
};
const randomMultiplier2 = () => {
  return Math.random() * 0.05 + 0.95;
};
const randomMultiplier3 = () => {
  return Math.random() * 0.1 + 0.9;
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
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const time = `${hours}:${minutes}:${seconds}`;

    const temperatureObj = {
      date: date.toISOString().split("T")[0],
      time,
      value: parseInt(item.field1) || 0,
    };
    const humidityObj = {
      date: date.toISOString().split("T")[0],
      time,
      value: parseInt(item.field2) || 0,
    };
    const pm25Obj = {
      date: date.toISOString().split("T")[0],
      time,
      value: parseInt(item.field3) || 0,
    };
    const pm10Obj = {
      date: date.toISOString().split("T")[0],
      time,
      value: parseInt(item.field4) || 0,
    };
    const COObj = {
      date: date.toISOString().split("T")[0],
      time,
      value: parseInt(item.field5) || 0,
    };
    const poisonGasObj = {
      date: date.toISOString().split("T")[0],
      time,
      value: parseInt(item.field6) || 0,
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

const multiplierLastValue = (data) => {
  const result = {};
  for (let field in data) {
    const value = Math.round(data[field] * randomMultiplier());
    result[field] = value;
  }
  return result;
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
};
