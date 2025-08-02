const mongoose = require("mongoose");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const userInfoSchema = mongoose.Schema(
  {
    UID: {
      type: Number,
      unique: true,
    },
    Name: {
      type: String,
    },
    EnquiryDate: {
      type: Date,
    },
    EnquiryCourse: {
      type: String,
    },
    CoursePrice: {
      type: Number,
    },
    Phone1: {
      type: String,
    },
    Phone2: {
      type: String,
    },
    Email: {
      type: String,
    },
    FollowupDate: {
      type: Date,
    },
    Status: {
      type: String,
    },
    Branch: {
      type: String,
    },
    City: {
      type: String,
    },
    Address: {
      type: String,
    },
    CreatedBy: {
      type: String,
    },
    Course: {
      type: String,
    },
    PrevFollowupDate: {
      type: Array,
    },
    prevStatusDate: {
      type: Array,
    },
    prevStatus: {
      type: Array,
    },
    prevCourse: {
      type: Array,
    },
    prevPrice: {
      type: Array,
    },
    LogType: {
      type: Array,
    },
    Remarks: {
      type: Array,
    },
    Source: {
      type: String,
    },
    AssignTo: {
      type: String,
    },
    location: {
      type: String,
    },
    image: {
      type: String,
    },
    Remark: {
      type: String,
    },
    lfd: {
      type: String,
    },
    Days2: {
      type: String,
    },
  },
  { timestamps: true }
);


const myDB = mongoose.connection.useDb("test");

const leadsInfo = myDB.model("leads", userInfoSchema);

module.exports = leadsInfo;