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
  handleDataDiagram,
  randomMultiplier2,
  randomMultiplier3,
  randomMultiplier4,
  multiplierLastValue,
  handleJSONValue,
} = require("./src/Data/dataUtils");
const { getDataFromAPI } = require("./src/Data/apiService");
const { interpolation } = require("./src/controllers/locationsController");
const Data = require("./src/models/dataModel");
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

const getLastDataFromMongoDB = async () => {
  const lastDocument = await Data.findOne({}).sort({ created_at: -1 }).exec();
  return lastDocument;
};

const getDataFromMongoDB = async (dataCountFill, intervalFill) => {
  const dataCount = dataCountFill;
  const interval = intervalFill; // 60 minutes
  const timeStamp = new Date().setHours(0, 0, 0, 0);
  const result = await Data.find({
    created_at: { $lt: timeStamp },
  })
    .sort({ entry_id: -1 }) // Sort in descending order of entry_id
    .limit(dataCount * interval);

  const filteredResult = result.filter(
    (entry, index) => index % interval === 0
  );
  const convertedData = handleDataDiagram(filteredResult.reverse());
  return convertedData;
};

const getMultiplier = (elementId) => {
  switch (elementId) {
    case "2":
      return randomMultiplier2();
    case "3":
      return randomMultiplier3();
    case "4":
      return randomMultiplier4();
    default:
      return 1;
  }
};
app.get("/", (req, res) => {
  res.status(200).send("Server connected successfully!");
});

app.get("/diagram/:id", async (req, res) => {
  try {
    const convertedData = await getDataFromMongoDB(10080, 1);
    if (req.params.id == "1") {
      res.json(convertedData);
    } else {
      const elementId = req.params.id;
      const multiplier = getMultiplier(elementId);

      const finalResult = Object.entries(convertedData).reduce(
        (result, [key, value]) => {
          if (Array.isArray(value)) {
            result[key] = value.map((e) => ({
              ...e,
              value: Math.round(e.value * multiplier),
            }));
          } else {
            result[key] = value;
          }
          return result;
        },
        {}
      );

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
    const lastDocument = await getLastDataFromMongoDB();
    const result = JSON.stringify(
      interpolation(req.body.markers, req.body.lat, req.body.lng, lastDocument)
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data from API" });
  }
});

app.get("/api/markers/:id", async (req, res, next) => {
  try {
    // Lấy giá trị cuối cùng từ MongoDB
    const lastDocument = await getLastDataFromMongoDB();
    if (lastDocument) {
      const markerId = req.params.id;
      let markerData;

      switch (markerId) {
        case "1":
          markerData = handleJSONValue(lastDocument);
          break;
        case "2":
          markerData = multiplierLastValue(handleJSONValue(lastDocument));
          break;
        case "3":
          markerData = multiplierLastValue(handleJSONValue(lastDocument));
          break;
        case "4":
          markerData = multiplierLastValue(handleJSONValue(lastDocument));
          break;
        default:
          // Trường hợp markerId không hợp lệ
          return res.status(404).json({ error: "Marker not found" });
      }

      // Trả về dữ liệu dưới dạng JSON
      res.json(markerData);
    } else {
      // Trường hợp không có dữ liệu trong MongoDB
      res.status(404).json({ error: "No data found in MongoDB" });
    }
  } catch (error) {
    console.error(error);
    // Xử lý lỗi nếu có
    res.status(500).json({ error: "Internal server error" });
  }
});

// SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
  const fetchDataAndSaveToDB = async () => {
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
      console.error("Failed to save data to MongoDB1");
    }
  };

  fetchDataAndSaveToDB();

  setInterval(fetchDataAndSaveToDB, 3 * 60 * 1000);
});
