const { fa } = require("faker/lib/locales");
const { date } = require("joi");
const mongoose = require("mongoose");

const issueSchema = mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    raisedTime: {
      type: String,
    },
    ticketId: {
      type: String,
    },
    status: {
      type: String,
      default: "Pending",
    },
    pageName: {
      type: String,
      required: [true, "page name is required"],
    },
    issueName: {
      type: String,
      required: [true, "issue name is required"],
    },
    image: {
      type: String,
      required: [true, "image is required"],
    },
    issueResolved: {
      type: Boolean,
      default: false,
    },
    resolveDate: {
      type: Date,
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

const issue = mongoose.model("issue", issueSchema);

module.exports = issue;
