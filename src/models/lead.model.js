const mongoose = require("mongoose");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const leadSchema = mongoose.Schema(
  {
    UID: {
      type: String,
    },
    // objectID: {
    //   type: Number,
    //   unique: true,
    //   index: true,
    // },
    assignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
    },
    statusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "status",
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "source",
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "city",
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "branch",
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    Name: {
      type: String,
    },
    EnquiryDate: {
      type: Date,
    },
    // EnquiryCourse: {
    //   type: String,
    // },
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
    // Status: {
    //   type: String,
    // },
    // Branch: {
    //   type: String,
    // },
    // City: {
    //   type: String,
    // },
    Address: {
      type: String,
    },
    CreatedBy: {
      type: String,
    },
    // Course: {
    //   type: String,
    // },
    PrevFollowupDate: {
      type: Array,
    },
    FollowupChangeBy: {
      type: Array,
      default: [],
    },
    FollowupChangeAt: {
      type: Array,
      default: [],
    },
    prevStatusDate: {
      type: Array,
    },
    InformationDate: {
      type: Array,
    },
    logAddedBy: {
      type: Array,
    },
    prevStatus: {
      type: Array,
    },
    prevCourse: {
      type: Array,
    },
    productHistory: [
      {
        courseName: String,
        coursePrice: Number,
        changedBy: String,
        changedAt: Date,
      },
    ],
    prevPrice: {
      type: Array,
    },
    LogType: {
      type: Array,
    },
    Remarks: {
      type: Array,
    },
    whoChangesState: {
      type: Array,
    },
    // Source: {
    //   type: String,
    // },
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
      type: Number,
      default: 0,
    },
    Days: {
      type: Number,
      default: 0,
    },
    Days2: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// leadSchema.pre("save", async function (next) {
//   try {
//     const doc = this;
//     if (!doc.isNew) {
//       return next(); // Skip if the document is not new
//     }

//     const maxSerialNumber = await mongoose
//       .model("leads")
//       .findOne()
//       .sort({ ObjectID: -1 })
//       .select("ObjectID")
//       .lean();

//     const nextSerialNumber = (maxSerialNumber?.ObjectID || 0) + 1;
//     doc.ObjectID = nextSerialNumber;
//     return next();
//   } catch (err) {
//     return next(err);
//   }
// });
// // Pre-save hook to automatically set ObjectID as _id
// leadSchema.pre("save", function (next) {
//   this.ObjectID = parseInt(this._id.toString(), 16);
//   next();
// });

// Pre-save hook to generate a unique 6-digit number and assign it to _id
// leadSchema.pre("save", function (next) {
//   if (!this.objectID) {
//     this.objectID = generateUniqueSixDigitNumber();
//   }
//   next();
// });

// Function to generate a unique 6-digit number
function generateUniqueSixDigitNumber() {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// leadSchema.pre("save", async function (next) {
//   try {
//     const doc = this;
//     if (!doc.isNew) {
//       return next(); // Skip if the document is not new
//     }

//     const UID = await mongoose
//       .model("leads")
//       .findOne()
//       .sort({ UID: -1 })
//       .select("UID")
//       .lean();

//     const nextEnrollmentNumber = UID?.UID || 0;
//     doc.UID = nextEnrollmentNumber;
//     return next();
//   } catch (err) {
//     return next(err);
//   }
// });

leadSchema.plugin(aggregatePaginate);

const leads = mongoose.model("leads", leadSchema);
module.exports = leads;
