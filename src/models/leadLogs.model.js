const mongoose = require("mongoose");

const leadLogsSchema = mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  logType: {
    type: String,
  },
  remarks: {
    type: String,
  },
  createdBy: {
    type: String,
  },
  createdDate: {
    type: String,
    default: new Date().getTime(),
  },
});

const leadLogs = mongoose.model("leadlogs", leadLogsSchema);
module.exports = leadLogs;
