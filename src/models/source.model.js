const mongoose = require("mongoose");

const sourceSchema = mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    SourceName: {
      type: String,
    },
    Description: {
      type: String,
    },
  },
  { timestamps: true }
);

sourceSchema.pre("save", async function (next) {
  try {
    const doc = this;
    if (!doc.isNew) {
      return next(); // Skip if the document is not new
    }

    const maxSerialNumber = await mongoose
      .model("source")
      .findOne()
      .sort({ serialNumber: -1 })
      .select("serialNumber")
      .lean();

    const nextSerialNumber = (maxSerialNumber?.serialNumber || 0) + 1;
    doc.serialNumber = nextSerialNumber;
    return next();
  } catch (err) {
    return next(err);
  }
});

const source = mongoose.model("source", sourceSchema);
module.exports = source;
