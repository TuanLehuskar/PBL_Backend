const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  created_at: {
    type: Date,
    default: Date.now,
    required: true,
    unique: true,
  },
  entry_id: Number,
  field1: String,
  field2: String,
  field3: String,
  field4: String,
  field5: String,
  field6: String,
});

const Data = mongoose.model("datas", dataSchema);

module.exports = Data;
