const mongoose = require("mongoose");

const invalidTokenSchema = mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
    },
    expires: {
      type: Date,
      //required: true,
    },
  },
  {
    timestamps: true,
  }
);
const invalidtokens = mongoose.model("invalidtokens", invalidTokenSchema);

module.exports = invalidtokens;
