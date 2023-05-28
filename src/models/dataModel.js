const mongoose = require("mongoose");
const dataSchema = new mongoose.Schema({
  created_at: {
    type: String,
    required: true,
    unique: true,
  },
  entry_id: Number,
  field1: String,
  field2: String,
  field3: String,
});

const Data = mongoose.model("Data", dataSchema);

module.exports = Data;
