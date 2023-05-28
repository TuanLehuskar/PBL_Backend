const mongoose = require("mongoose");
const dotEnv = require("dotenv");

if (process.env.NODE_ENV == "production") {
  dotEnv.config({ path: "./config.env" });
} else {
  dotEnv.config({ path: "./local.env" });
}
const app = require("./app");
const cors = require("cors");
const axios = require("axios");
const { handleTimeData, getDataField } = require("./src/Data/dataUtils");
const { getDataFromAPI } = require("./src/Data/apiService");
const Data = require("./src/models/dataModel");
app.use(cors());
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
    await Data.insertMany(data.feeds);

    console.log("Data saved to MongoDB");
  } catch (error) {
    console.error("Failed to save data to MongoDB");
  }
});

// Dừng công việc sau một khoảng thời gian (ví dụ: 1 giờ)
setTimeout(() => {
  clearInterval(saveDataInterval);
  console.log("Interval job stopped");
}, 3600000); // 1 giờ

app.get("/map", async (req, res) => {
  try {
    const response = await getDataFromAPI(
      "https://thingspeak.com/channels/2099351/feed.json"
    );
    const data = response;

    // Xử lý dữ liệu JSON
    const processedData = handleTimeData(data);
    res.json(processedData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data from API" });
  }
});

app.get("/dashboard", async (req, res) => {
  try {
    const response = await getDataFromAPI(
      "https://thingspeak.com/channels/2099351/feed.json"
    );
    const data = response;

    // Xử lý dữ liệu JSON
    const processedData = handleTimeData(data);
    const extractedData = getDataField(processedData);
    res.json(extractedData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data from API" });
  }
});

// SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
