const mongoose = require("mongoose");

const branchSchema = mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "user",
    },
    BranchName: {
      type: String,
    },
  },
  { timestamps: true }
);

// branchSchema.pre("save", async function (next) {
//   try {
//     const doc = this;
//     if (!doc.isNew) {
//       return next(); // Skip if the document is not new
//     }

//     const maxSerialNumber = await mongoose
//       .model("branch")
//       .findOne()
//       .sort({ serialNumber: -1 })
//       .select("serialNumber")
//       .lean();

//     const nextSerialNumber = (maxSerialNumber?.serialNumber || 0) + 1;
//     doc.serialNumber = nextSerialNumber;
//     return next();
//   } catch (err) {
//     return next(err);
//   }
// });

const branch = mongoose.model("branch", branchSchema);
module.exports = branch;
