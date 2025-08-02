const mongoose = require("mongoose");

const courseSchema = mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    CourseName: {
      type: String,
    },
    CourseValue: {
      type: Number,
    },
  },
  { timestamps: true }
);

courseSchema.pre("save", async function (next) {
  try {
    const doc = this;
    if (!doc.isNew) {
      return next(); // Skip if the document is not new
    }

    const maxSerialNumber = await mongoose
      .model("course")
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

const course = mongoose.model("course", courseSchema);
module.exports = course;
