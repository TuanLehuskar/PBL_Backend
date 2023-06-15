const mongoose = require("mongoose");
const dotEnv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { inspect } = require("util");
if (process.env.NODE_ENV == "production") {
  dotEnv.config({ path: "./config.env" });
} else {
  dotEnv.config({ path: "./local.env" });
}
const app = require("./app");
const cors = require("cors");
const axios = require("axios");
const {
  handleTimeData,
  separateDataByField,
  updateDataPeriodically,
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
  .then(() => console.log("DB connect successfully"));

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

app.post("/click", async (req, res) => {
  try {
    const result = JSON.stringify(
      interpolation(req.body.markers, req.body.lat, req.body.lng)
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data from API" });
  }
});

app.get("/api/dashboard/:id", async (req, res) => {
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

app.get("/api/markers/:id", async (req, res) => {
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
  setInterval(updateDataPeriodically, 30000);
});
