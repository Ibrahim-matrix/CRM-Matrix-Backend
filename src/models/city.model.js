const mongoose = require("mongoose");

const citySchema = mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: "user",
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "branch",
    },
    cityName: {
      type: String,
    },
  },
  { timestamps: true }
);

const city = mongoose.model("city", citySchema);
module.exports = city;
