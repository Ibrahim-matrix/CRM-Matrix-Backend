const { string } = require("joi");
const mongoose = require("mongoose");

const indiaMartLeadSchema = mongoose.Schema({
  PARENT_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"user",
  },
  UNIQUE_QUERY_ID: {
    type: String,
  },
  QUERY_TYPE: {
    type: String,
  },
  QUERY_TIME: {
    type: String,
  },
  SENDER_NAME: {
    type: String,
  },
  SENDER_MOBILE: {
    type: String,
  },
  SENDER_EMAIL: {
    type: String,
  },
  SUBJECT: {
    type: String,
  },
  SENDER_COMPANY: {
    type: String,
  },
  SENDER_ADDRESS: {
    type: String,
  },
  SENDER_CITY: {
    type: String,
  },
  SENDER_STATE: {
    type: String,
  },
  SENDER_PINCODE: {
    type: String,
  },
  SENDER_COUNTRY_ISO: {
    type: String,
  },
  SENDER_MOBILE_ALT: {
    type: String,
  },
  SENDER_PHONE: {
    type: String,
  },
  SENDER_PHONE_ALT: {
    type: String,
  },
  SENDER_EMAIL_ALT: {
    type: String,
  },
  QUERY_PRODUCT_NAME: {
    type: String,
  },
  QUERY_MESSAGE: {
    type: String,
  },
  QUERY_MCAT_NAME: {
    type: String,
  },
  CALL_DURATION: {
    type: String,
  },
  RECEIVER_MOBILE: {
    type: String,
  },
  ASSIGNED: {
    type: Boolean,
    default: false,
  },
});

const indiamartleads = mongoose.model("indiamartleads", indiaMartLeadSchema);
module.exports = indiamartleads;
