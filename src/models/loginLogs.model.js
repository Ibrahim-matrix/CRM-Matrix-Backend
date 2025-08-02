const mongoose = require("mongoose");

const loginLogSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"user"
  },
  type: {
    type: Number,
    enum: [1, 2], //1 = failed ,2=Success
    default: null,
  },
  loginType: {
    type: Number,
    enum: [1, 2], //1 = web ,2 = app
    default: null,
  },
  token: {
    type: String,
  },
  createdDate: {
    type: String,
    default: new Date().getTime(),
  },
});

const loginLogs = mongoose.model("loginlogs", loginLogSchema);

module.exports = loginLogs;
