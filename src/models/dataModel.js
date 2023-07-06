const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  created_at: {
    type: Date,
    default: Date.now,
  },
  entry_id: {
    type: Number,
    required: true,
    unique: true,
  },
  field1: String,
  field2: String,
  field3: String,
  field4: String,
  field5: String,
  field6: String,
  field7: String,
  field8: String,
});

const Data = mongoose.model("datas", dataSchema);

module.exports = Data;
