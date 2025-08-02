const mongoose = require("mongoose");

let punchSchema = mongoose.Schema({
  Tran_MachineRawPunchId: {
    type: Number,
  },
  CardNo: {
    type: String,
  },
  PunchDatetime: {
    type: String,
  },
  P_Day: {
    type: String,
  },
  ISManual: {
    type: String,
  },
  PayCode: {
    type: String,
    default: null,
  },
  MachineNo: {
    type: String,
    default: null,
  },
});

const DB = mongoose.connection.useDb("attendance_management");

const punches = DB.model("punches", punchSchema);

module.exports = punches;
