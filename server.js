const mongoose = require("mongoose");
const dotEnv = require("dotenv");
const fs = require("fs");
if (process.env.NODE_ENV == "production") {
  dotEnv.config({ path: "./config.env" });
} else {
  dotEnv.config({ path: "./local.env" });
}
const app = require("./app");
const axios = require("axios");
const {
  handleTimeData,
  separateDataByField,
  updateDataPeriodically,
  handleDataDiagram,
  randomMultiplier2,
  randomMultiplier3,
  randomMultiplier4,
} = require("./src/Data/dataUtils");
const { getDataFromAPI } = require("./src/Data/apiService");
const {
  distanceCal,
  findNearestMarkers,
} = require("./src/controllers/mapController");
const { interpolation } = require("./src/controllers/locationsController");
const Data = require("./src/models/dataModel");
const dataDUT1 = require("./src/Data/dut1Data");
const dataDUT2 = require("./src/Data/dut2Data");
const dataDUT3 = require("./src/Data/dut3Data");
const dataDUTCenter = require("./src/Data/dutCenterData");

const allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
};

app.use(allowCrossDomain);
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connect successfully"))
  .catch((err) => console.error(err));

// app.get("/diagram/:id", async (req, res) => {
//   try {
//     if (req.params.id == "1") {
//       const dataCount = 48;
//       const interval = 60; // 30 minutes

//       const result = await Data.find()
//         .sort({ entry_id: -1 }) // Sort in descending order of entry_id
//         .limit(dataCount * interval);

//       const filteredResult = result.filter(
//         (entry, index) => index % interval === 0
//       );
//       const convertedData = handleDataDiagram(filteredResult.reverse());
//       res.json(convertedData);
//     } else {
//       let elementData;
//       const elementId = req.params.id;
//       switch (elementId) {
//         case "2":
//           elementData = dataDUT2;
//           break;
//         case "3":
//           elementData = dataDUT3;
//           break;
//         case "4":
//           elementData = dataDUTCenter;
//           break;
//       }
//       res.json(elementData);
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// });
app.get("/diagram/:id", async (req, res) => {
  try {
    const dataCount = 48;
    const interval = 60; // 30 minutes

    const result = await Data.find()
      .sort({ entry_id: -1 }) // Sort in descending order of entry_id
      .limit(dataCount * interval);

    const filteredResult = result.filter(
      (entry, index) => index % interval === 0
    );
    const convertedData = handleDataDiagram(filteredResult.reverse());
    if (req.params.id == "1") {
      res.json(convertedData);
    } else {
      let finalResult = convertedData;
      let elementData;
      const elementId = req.params.id;
      switch (elementId) {
        case "2":
          for (const key in finalResult) {
            if (
              finalResult.hasOwnProperty(key) &&
              Array.isArray(finalResult[key])
            ) {
              finalResult[key] = finalResult[key].map((e) => ({
                ...e,
                value: Math.round(e.value * randomMultiplier2()),
              }));
            }
          }
          break;
        case "3":
          for (const key in finalResult) {
            if (
              finalResult.hasOwnProperty(key) &&
              Array.isArray(finalResult[key])
            ) {
              finalResult[key] = finalResult[key].map((e) => ({
                ...e,
                value: Math.round(e.value * randomMultiplier3()),
              }));
            }
          }
          break;
        case "4":
          for (const key in finalResult) {
            if (
              finalResult.hasOwnProperty(key) &&
              Array.isArray(finalResult[key])
            ) {
              finalResult[key] = finalResult[key].map((e) => ({
                ...e,
                value: Math.round(e.value * randomMultiplier4()),
              }));
            }
          }
          break;
      }
      res.json(finalResult);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/", async (req, res) => {
  try {
    const response = await getDataFromAPI(
      "https://thingspeak.com/channels/2099351/feed.json"
    );
    const data = response;

    // Xử lý dữ liệu JSON

    // Lưu dữ liệu vào MongoDB
    await Data.insertMany(data.feeds, { ordered: false });

    console.log("Data saved to MongoDB");
  } catch (error) {
    console.error("Failed to save data to MongoDB");
  }
});

app.post("/click", async (req, res, next) => {
  try {
    const result = JSON.stringify(
      interpolation(req.body.markers, req.body.lat, req.body.lng)
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data from API" });
  }
});

app.get("/api/dashboard/:id", async (req, res, next) => {
  const elementId = req.params.id;
  let elementData;
  switch (elementId) {
    case "1":
      elementData = dataDUT1;
      break;
    case "2":
      elementData = dataDUT2;
      break;
    case "3":
      elementData = dataDUT3;
      break;
    case "4":
      elementData = dataDUTCenter;
      break;
  }
  if (elementData) {
    res.json(elementData);
  } else {
    res.status(404).json({ error: "Temperature not found" });
  }
});

app.get("/api/markers/:id", async (req, res, next) => {
  const markerId = req.params.id;
  let markerData;
  switch (markerId) {
    case "1":
      markerData = dataDUT1;
      break;
    case "2":
      markerData = dataDUT2;
      break;
    case "3":
      markerData = dataDUT3;
      break;
    case "4":
      markerData = dataDUTCenter;
      break;
  }
  if (markerData) {
    // Trả về dữ liệu dưới dạng JSON
    res.json(markerData);
  } else {
    // Trường hợp không tìm thấy markerId
    res.status(404).json({ error: "Marker not found" });
  }
});

// SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
  setInterval(updateDataPeriodically, 15000);
});
