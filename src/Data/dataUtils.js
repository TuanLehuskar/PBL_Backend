const { getDataFromAPI } = require("./apiService");
const path = require("path");
const { inspect } = require("util");
const fs = require("fs");

const dataDUT1 = require("./dut1Data");
const dataDUT2 = require("./dut2Data");
const dataDUT3 = require("./dut3Data");
const dataDUTCenter = require("./dutCenterData");

const handleTimeData = (data) => {
  const feeds = data.feeds.map((feed) => {
    const createdAt = new Date(feed.created_at);
    const time = createdAt.toTimeString().slice(0, 8);
    const date = createdAt.toISOString().slice(0, 10);

    return {
      ...feed,
      time: time,
      date: date,
    };
  });

  return { feeds: feeds };
};

// const getDataField = (data) => {
//   const extractedData = data.feeds.map((feed) => ({
//     date: feed.date,
//     field: feed.field1,
//   }));

//   return extractedData;
// };
// function separateDataByDay(data, field) {
//   const separatedData = {};

//   data.feeds.forEach((item) => {
//     const { date, ...rest } = item;

//     if (!separatedData[date]) {
//       separatedData[date] = [];
//     }

//     separatedData[date].push(rest[field]);
//   });

//   return separatedData;
// }

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

const updateDataPeriodically = () => {
  setInterval(async () => {
    try {
      const response = await getDataFromAPI(
        "https://thingspeak.com/channels/2099351/feed.json"
      );
      const data = response;

      // Xử lý dữ liệu JSON
      const processedData = handleTimeData(data);
      const formattedData = {
        temperature: processedData.feeds.map((feed) => ({
          date: feed.date,
          time: feed.time,
          value: feed.field1 !== null ? parseFloat(feed.field1) : 30,
        })),
        humidity: processedData.feeds.map((feed) => ({
          date: feed.date,
          time: feed.time,
          value: feed.field2 !== null ? parseFloat(feed.field2) : 70,
        })),
        pm25: processedData.feeds.map((feed) => ({
          date: feed.date,
          time: feed.time,
          value: feed.field3 !== null ? parseFloat(feed.field3) : 160,
        })),
        pm10: processedData.feeds.map((feed) => ({
          date: feed.date,
          time: feed.time,
          value: feed.field4 !== null ? parseFloat(feed.field4) : 170,
        })),
        CO: processedData.feeds.map((feed) => ({
          date: feed.date,
          time: feed.time,
          value: feed.field5 !== null ? parseFloat(feed.field5) : 170,
        })),
        poisonGas: processedData.feeds.map((feed) => ({
          date: feed.date,
          time: feed.time,
          value: feed.field6 !== null ? parseFloat(feed.field6) : 180,
        })),
      };
      const filePath = path.join(__dirname, "/", "dut1Data.js");
      const objectString = inspect(formattedData, { depth: null });
      const fileContent = `const data = ${objectString};\n\nmodule.exports = data;`;
      fs.writeFile(filePath, fileContent, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("Dữ liệu đã được ghi vào file dut1Data.js");
        }
      });
    } catch (error) {
      console.error(error);
    }
  }, 15000); // Gửi request và ghi dữ liệu vào file mỗi 15 giây
};

module.exports = {
  handleTimeData,
  separateDataByField,
  updateDataPeriodically,
};
