const { default: mongoose } = require("mongoose");
const { source, leads, course, status } = require("../models");
const { dashboardService, leadService, userService } = require("../services");
const catchAsync = require("../utils/catchAsync");
const { ObjectId } = require("mongodb");

const getLeadsDetail = catchAsync(async (req, res) => {
  let leads = await dashboardService.getLeadsDetail();

  return res.status(200).json({
    message: "Leads",
    Data: leads,
  });
});
// const getAnalyticsDetail = catchAsync(async (req, res) => {
//   let filter = {};
//   if (req.user.UserType === 2) {
//     filter.parentId = new ObjectId(req.user.userId);
//   } else {
//     return res.status(401).json({
//       message: "Unauthorized access",
//     });
//   }

//   try {
//     // Get courses
//     const courses = await course.find(filter);

//     // Create an array of promises to get lead sums for each course
//     const leadSumsPromises = courses.map(async (course) => {
//       const leadSumResult = await leads.aggregate([
//         {
//           $match: { courseId: course._id },
//         },
//         {
//           $group: {
//             _id: null,
//             totalCoursePrice: { $sum: "$CoursePrice" },
//             leadCount: { $sum: 1 }, // Count the number of leads
//           },
//         },
//       ]);

//       const { totalCoursePrice, leadCount } =
//         leadSumResult.length > 0
//           ? leadSumResult[0]
//           : { totalCoursePrice: 0, leadCount: 0 };

//       return {
//         courseName: course.CourseName,
//         revenue: totalCoursePrice,
//         leadCount,
//       };
//     });

//     // Wait for all promises to resolve
//     const leadSums = await Promise.all(leadSumsPromises);

//     return res.status(200).json({
//       message: "Course Analytics",
//       Data: leadSums,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: error.message,
//     });
//   }
// });



// const getAnalyticsDetail = catchAsync(async (req, res) => {
//   const user = req.user;

//   // Only UserType 2 is allowed
//   if (user.UserType !== 2) {
//     return res.status(403).json({ message: "Unauthorized access" });
//   }
//   const userId = new mongoose.Types.ObjectId(user.userId);

//   const leadCount = await leads.countDocuments({ parentId: userId });
//   console.log("Leads for parentId:", leadCount);

//   const sample = await leads.findOne({ parentId: userId });
//   console.log("Sample lead:", sample);

//   console.log("Course ID:", sample?.courseId);
//   console.log("Status ID:", sample?.statusId);

//   const courseId = sample.courseId;
//   if (!mongoose.Types.ObjectId.isValid(courseId)) {
//     console.log("❌ Invalid courseId format");
//   } else {
//     const courseExists = await mongoose.model("course").findById(courseId);
//     if (!courseExists) {
//       console.log("❌ Course not found:", courseId);
//     } else {
//       console.log("✅ Course found:", courseExists.CourseName);
//     }
//   }


//   const courseDoc = await course.findById(courseId);
//   console.log("Course parentId:", courseDoc.parentId);
//   console.log("Requesting userId (req.user.userId):", req.user.userId);

//   const result = await leads.aggregate([
//     {
//       $match: {
//         courseId: new mongoose.Types.ObjectId("64e0b3769b86ecfb1173a513"),
//         parentId: new mongoose.Types.ObjectId("64afa5186760084b3466b9fa")
//       }
//     },
//     {
//       $group: {
//         _id: "$courseId",
//         totalRevenue: { $sum: "$CoursePrice" },
//         leadCount: { $sum: 1 }
//       }
//     }
//   ]);

//   console.log("Test Aggregation Result:", result);


//   // const analytics = await leads.aggregate([
//   //   {
//   //     $match: {
//   //       parentId: userId,
//   //     },
//   //   },
//   //   {
//   //     $lookup: {
//   //       from: "courses",
//   //       localField: "courseId",
//   //       foreignField: "_id",
//   //       as: "course",
//   //     },
//   //   },
//   //   {
//   //     $unwind: {
//   //       path: "$course",
//   //       preserveNullAndEmptyArrays: false, // ensure only valid joins
//   //     },
//   //   },
//   //   {
//   //     $lookup: {
//   //       from: "statuses",
//   //       localField: "statusId",
//   //       foreignField: "_id",
//   //       as: "status",
//   //     },
//   //   },
//   //   {
//   //     $unwind: {
//   //       path: "$status",
//   //       preserveNullAndEmptyArrays: false,
//   //     },
//   //   },
//   //   {
//   //     $group: {
//   //       _id: {
//   //         courseId: "$course._id",
//   //         courseName: "$course.CourseName",
//   //         statusId: "$status._id",
//   //         statusName: "$status.StatusName",
//   //       },
//   //       revenue: { $sum: "$CoursePrice" },
//   //       leadCount: { $sum: 1 },
//   //     },
//   //   },
//   //   {
//   //     $group: {
//   //       _id: {
//   //         courseId: "$_id.courseId",
//   //         courseName: "$_id.courseName",
//   //       },
//   //       statuses: {
//   //         $push: {
//   //           statusId: "$_id.statusId",
//   //           statusName: "$_id.statusName",
//   //           revenue: "$revenue",
//   //           leadCount: "$leadCount",
//   //         },
//   //       },
//   //     },
//   //   },
//   //   {
//   //     $project: {
//   //       _id: 0,
//   //       courseId: "$_id.courseId",
//   //       courseName: "$_id.courseName",
//   //       statuses: 1,
//   //     },
//   //   },
//   // ]);

//   return res.status(200).json({
//     message: "Course Analytics",
//     data: result,
//   });
// });

const getAnalyticsDetail = catchAsync(async (req, res) => {
  try {
    const parentId = req.user.userId;

    // 1. Aggregate lead data grouped by courseId + statusId
    const leadAggregates = await leads.aggregate([
      {
        $match: {
          parentId: new mongoose.Types.ObjectId(parentId),
        },
      },
      {
        $group: {
          _id: {
            courseId: "$courseId",
            statusId: "$statusId",
          },
          revenue: { $sum: "$CoursePrice" },
          leads: { $sum: 1 },
        },
      },
    ]);

    // 2. Aggregate total leads per course
    const totalLeadsPerCourse = await leads.aggregate([
      {
        $match: {
          parentId: new mongoose.Types.ObjectId(parentId),
        },
      },
      {
        $group: {
          _id: "$courseId",
          totalLeads: { $sum: 1 },
        },
      },
    ]);


    // 2. Extract unique courseIds and statusIds
    const courseIds = [...new Set(leadAggregates.map(l => l._id.courseId.toString()))];
    const statusIds = [...new Set(leadAggregates.map(l => l._id.statusId.toString()))];

    // 3. Get course and status details
    const coursesList = await course.find({ _id: { $in: courseIds } }).lean();
    const statusesList = await status.find({ _id: { $in: statusIds } }).lean();

    // 4. Build response
    const finalData = [];

    for (const courseItem of coursesList) {
      const courseIdStr = courseItem._id.toString();

      const entry = {
        courseName: courseItem.CourseName,
        courseId: courseIdStr,
        totalLeads: 0, // default to 0
      };

      const relatedData = leadAggregates.filter(
        l => l._id.courseId.toString() === courseIdStr
      );

      for (const item of relatedData) {
        const statusObj = statusesList.find(
          s => s._id.toString() === item._id.statusId.toString()
        );

        if (statusObj) {
          entry[statusObj.StatusName] = {
            revenue: item.revenue,
            leads: item.leads,
          };
        }
      }

      // Attach totalLeads for this course
      const totalLeadsObj = totalLeadsPerCourse.find(
        c => c._id.toString() === courseIdStr
      );

      if (totalLeadsObj) {
        entry.totalLeads = totalLeadsObj.totalLeads;
      }

      finalData.push(entry);
    }

    return res.status(200).json({
      message: "Course-wise Status Analytics",
      Data: finalData,
    });

  } catch (error) {
    console.error("Error in course analytics:", error);
    return res.status(500).json({ message: error.message });
  }
});

const getCallDetails = catchAsync(async (req, res) => {
  try {
    const parentId = req.user.userId;

    // Parse the date range from frontend
    const { startDate, endDate } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Match leads by parentId and EnquiryDate range
    const leadsByUser = await leads.aggregate([
      {
        $match: {
          parentId: new mongoose.Types.ObjectId(parentId),
          EnquiryDate: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: "$assignId",           // Group by assigned user
          totalLeads: { $sum: 1 },  // Count number of leads
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          userName: "$user.Name",   // Show the user's name
          userId: "$_id",
          totalLeads: 1,
          _id: 0,
        },
      },
    ]);

    return res.status(200).json({
      message: "User-wise lead count",
      Data: leadsByUser,
    });

  } catch (error) {
    console.error("Error fetching call details:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


const getSourceDetails = catchAsync(async (req, res) => {
  let filter = {};

  if (req.user.UserType === 2) {
    filter.parentId = req.user.userId;
  } else {
    return res.status(401).json({
      message: "Unauthorized access",
    });
  }

  try {
    const sources = await source.find(filter);

    const leadCountsPromises = sources.map(async (src) => {
      const leadCount = await leads.countDocuments(
        { sourceId: src._id },
        { projection: { _id: 1, sourceId: 1 } }
      );
      return { sourceName: src.SourceName, count: leadCount };
    });

    // Wait for all promises to resolve
    const leadCounts = await Promise.all(leadCountsPromises);

    return res.status(200).json({
      message: "Source data",
      Data: leadCounts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
});

const getLeadsCount = catchAsync(async (req, res) => {
  // {
  //         AssignTo: {
  //           $in: ["Saurabh"],
  //         },
  //       },
  let filter = {};
  if (req.user.UserType == 2) {
    filter = {
      $or: [
        { parentId: new ObjectId(req.user.userId) },
        { StatusName: { $in: ["Open", "Final", "Purchased"] } },
      ],
    };
  }
  if (req.user.UserType == 3) {
    filter = {
      $or: [
        { parentId: new ObjectId(req.user.parentId) },
        { StatusName: { $in: ["Open", "Final", "Purchased"] } },
      ],
    };
  }
  // if (req.user.UserType == 3) {
  //   let arr = [];
  //   if (req.user.Permission.length == 0) {
  //     arr.push(req.user.Name);
  //     filter["AssignTo"] = {
  //       $in: arr,
  //     };
  //   }
  //   if (req.user.Permission.length > 0) {
  //     for (let permissionId of req.user.Permission) {
  //       let user = await userService.getUserById(permissionId);
  //       arr.push(user.Name);
  //     }
  //     filter["AssignTo"] = {
  //       $in: arr,
  //     };
  //   }
  // }

  let leadsCount = await leadService.getLeadsCount(filter);

  // let resp = {
  //   totalPrice: 0,
  //   openPrice: 0,
  //   enrolledPrice: 0,
  //   finalPrice: 0,
  //   hotPrice: 0,
  //   unsubscribePrice: 0,
  //   wrongPrice: 0,
  // };
  // const priceMap = {
  //   Open: "openPrice",
  //   "Final Lead": "finalPrice",
  //   "Hot Lead": "hotPrice",
  //   Enrolled: "enrolledPrice",
  //   "Wrong Lead": "wrongPrice",
  //   Unsubscribe: "unsubscribePrice",
  // };

  // leadsCount[0].Price.forEach((element) => {
  //   const key = priceMap[element._id];
  //   if (key) {
  //     resp[key] = element.Price ? element.Price : 0;
  //   }
  // });
  // resp["totalPrice"] =
  //   resp.openPrice + resp.enrolledPrice + resp.finalPrice + resp.hotPrice;
  // delete leadsCount[0].Price;
  // let respp = { ...leadsCount[0], ...resp };
  return res.status(200).json({
    message: "successs",
    Data: leadsCount,
  });
});

module.exports = {
  getLeadsDetail,
  getAnalyticsDetail,
  getCallDetails,
  getSourceDetails,
  getLeadsCount,
};
