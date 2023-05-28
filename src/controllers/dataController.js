const Data = require("../models/dataModel");
exports.getAllTours = async (req, res) => {
  try {
    const data = await Data.find();

    res.status(200).json({
      status: "success",
      data,
    });
  } catch {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
