const { leads, leadLogs, leadsInfo, status, course } = require("../models");
const { ObjectId } = require("mongodb");

const addLead = async (bodyData) => {
  const lead = await leads.findOne({ Email: bodyData.Email });
  return await leads.create(bodyData);
};

const updateLead = async (leadId, updateData, res) => {
  let lead = await leads.findById(leadId);

  // if (updateData.EnquiryCourse) {
  //   // console.log("checking something");
  //   // console.log(lead.courseId, updateData.EnquiryCourse);
  //   // console.log(lead.courseId === updateData.EnquiryCourse);
  //   if (lead.courseId && lead.courseId.equals(updateData.EnquiryCourse)) {
  //     return res.status(400).send({
  //       message: "Select product other than the current one",
  //     });
  //   }
  //   let data = await course.findOne({ _id: updateData.EnquiryCourse });
  //   lead.courseId = updateData.EnquiryCourse;
  //   lead.prevCourse.push(data.CourseName);
  //   lead.CoursePrice = data.CourseValue;
  //   lead.prevPrice.push(data.CourseValue);
  //   console.log("check lead", lead);
  //   await lead.save();
  // } else if (updateData.CoursePrice) {
  //   let data = await course.findOne({ _id: lead.courseId });
  //   lead.prevCourse.push(data.CourseName);
  //   lead.CoursePrice = updateData.CoursePrice;
  //   lead.prevPrice.push(updateData.CoursePrice);
  //   await lead.save();
  // }
  if (updateData.EnquiryCourse || updateData.CoursePrice) {
    const currentCourseId = lead.courseId;
    const currentCourse = await course.findById(currentCourseId);
    const newCourse = updateData.EnquiryCourse
      ? await course.findById(updateData.EnquiryCourse)
      : currentCourse;

    const newPrice = updateData.CoursePrice || newCourse.CourseValue;
    const newCourseName = newCourse.CourseName;

    const changedBy = updateData.Name || updateData.userId || "Unknown";

    const hasCourseChanged =
      updateData.EnquiryCourse &&
      (!lead.courseId || !lead.courseId.equals(updateData.EnquiryCourse));
    const hasPriceChanged =
      updateData.CoursePrice && lead.CoursePrice !== updateData.CoursePrice;

    if (hasCourseChanged || hasPriceChanged) {
      lead.productHistory = lead.productHistory || [];

      lead.productHistory.push({
        courseName: newCourseName,
        coursePrice: newPrice,
        changedBy: changedBy,
        changedAt: new Date(),
      });

      // Apply changes
      if (hasCourseChanged) {
        lead.courseId = updateData.EnquiryCourse;
      }
      if (hasPriceChanged) {
        lead.CoursePrice = newPrice;
      }

      await lead.save();
    } else {
      return res.status(400).send({
        message: "Select product or price different than the current one",
      });
    }
  } else if (updateData.FollowupDate) {
    if (
      lead.FollowupDate &&
      lead.FollowupDate.toISOString() !==
        new Date(updateData.FollowupDate).toISOString()
    ) {
      lead.PrevFollowupDate.push(lead.FollowupDate);
      lead.FollowupChangeBy = lead.FollowupChangeBy || [];
      lead.FollowupChangeAt = lead.FollowupChangeAt || [];

      lead.FollowupChangeBy.push(
        updateData.Name || updateData.userId || "Unknown"
      );
      lead.FollowupChangeAt.push(new Date());
    }
    lead.FollowupDate = updateData.FollowupDate;
    await lead.save();
  } else if (updateData.Status) {
    if (lead.statusId && lead.statusId.equals(updateData.Status)) {
      return res.status(400).send({
        message: "Select status other than the current one",
      });
    }
    const data = await status.findOne({ _id: updateData.Status });
    let dd = new Date();
    lead.statusId = updateData.Status;
    lead.prevStatus.push(data.StatusName);
    lead.prevStatusDate.push(dd);
    lead.whoChangesState.push(updateData.Name), await lead.save();
  }
};

const deleteLead = async (leadId) => {
  return await leads.findOneAndDelete({
    _id: leadId,
  });
};

const getLeads = async (filter, options) => {
  //calculate current date and subtract -1 fro getting yesterday date
  let curDate = new Date();
  curDate.setDate(curDate.getDate() - 1);
  var aggregate = leads.aggregate([
    {
      $match: filter,
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $addFields: {
        daysss: {
          $floor: {
            $divide: [
              {
                $subtract: ["$FollowupDate", curDate],
              },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
    },

    {
      $project: {
        UID: 1,
        AssignTo: 1,
        Source: 1,
        City: 1,
        Status: 1,
        EnquiryDate: 1,
        Name: 1,
        Phone1: 1,
        Phone2: 1,
        Course: "$EnquiryCourse",
        CoursePrice: 1,
        Days2: 1,
        daysss: 1,
        FollowupDate: 1,
      },
    },
  ]);

  return await leads.aggregatePaginate(aggregate, options);
};

const getLeadById = async (leadId) => {
  return await leads
    .findOne({ _id: leadId })
    .populate("assignId courseId statusId sourceId cityId branchId");
};

// const getLeadById = async (leadId) => {
//   try {
//     console
//     const result = await leads.aggregate([
//       {
//         $match: { _id: leadId },
//       },
//       // {
//       //   $lookup: {
//       //     from: "users",
//       //     localField: "assignId",
//       //     foreignField: "_id",
//       //     as: "AssignInfo",
//       //   },
//       // },
//       // {
//       //   $lookup: {
//       //     from: "status",
//       //     localField: "statusId",
//       //     foreignField: "_id",
//       //     as: "StatusInfo",
//       //   },
//       // },
//       // {
//       //   $lookup: {
//       //     from: "courses",
//       //     localField: "courseId",
//       //     foreignField: "_id",
//       //     as: "CourseInfo",
//       //   },
//       // },
//       // {
//       //   $lookup: {
//       //     from: "sources",
//       //     localField: "sourceId",
//       //     foreignField: "_id",
//       //     as: "SourceInfo",
//       //   },
//       // },
//       // // Add more lookup stages for other collections if needed

//       // {
//       //   $project: {
//       //     _id: 0, // Exclude _id field
//       //     assignId: 1, // Include assignId
//       //     courseId: 1, // Include courseId
//       //     sourceId: 1, // Include sourceId
//       //     // Add other fields from the lead document that you need
//       //     AssignInfo: { $arrayElemAt: ["$AssignInfo", 0] },
//       //     StatusInfo: { $arrayElemAt: ["$StatusInfo", 0] },
//       //     CourseInfo: { $arrayElemAt: ["$CourseInfo", 0] },
//       //     SourceInfo: { $arrayElemAt: ["$SourceInfo", 0] },
//       //     // Add fields from other lookup collections if needed
//       //   },
//       // },
//     ]).exec();
// console.log("------",result)
//     if (result.length > 0) {
//       return {
//         message: "success",
//         Data: result,
//         leadLogss: [],
//         prevCourses: [],
//         prevStatusHistory: [],
//       };
//     } else {
//       return {
//         message: "Lead not found",
//         Data: null,
//         leadLogss: [],
//         prevCourses: [],
//         prevStatusHistory: [],
//       };
//     }
//   } catch (error) {
//     // Handle errors appropriately
//     console.error("Error fetching lead:", error);
//     throw error;
//   }
// };

const addLeadLogs = async (leadId, leadLogData) => {
  const { LogType, Remarks, name } = leadLogData;
  const d = new Date();
  return await leads.findOneAndUpdate(
    { _id: leadId },
    {
      $push: {
        LogType: LogType,
        Remarks: Remarks,
        InformationDate: d,
        logAddedBy: name,
      },
    }
  );
  return await leadLogs.create(leadLogData);
};

const getLeadsByEmailOrPhone = async (Email, Phone1, Phone2) => {
  return await leads.aggregate([
    {
      $match: {
        $or: [
          {
            Email: Email,
          },
          {
            Phone1: Phone1,
          },
          {
            Phone2: Phone2,
          },
        ],
      },
    },
  ]);
};
const getDuplicateLeads = async (filter) => {
  return await leads.aggregate([
    {
      $match: filter,
    },
  ]);
};

const TodaysFollowupLeads = async (filter, options) => {
  try {
    const agg = leads.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "users",
          localField: "parentId",
          foreignField: "_id",
          as: "ParentInfo",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "assignId",
          foreignField: "_id",
          as: "AssignInfo",
        },
      },
      {
        $lookup: {
          from: "sources",
          localField: "sourceId",
          foreignField: "_id",
          as: "SourceInfo",
        },
      },
      {
        $lookup: {
          from: "cities",
          localField: "cityId",
          foreignField: "_id",
          as: "CityInfo",
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "CourseInfo",
        },
      },
      {
        $lookup: {
          from: "status",
          localField: "statusId",
          foreignField: "_id",
          as: "StatusInfo",
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "branchId",
          foreignField: "_id",
          as: "BranchInfo",
        },
      },
    ]);

    const result = await leads.aggregatePaginate(agg, options);

    return result;
  } catch (error) {
    console.error("Error in TodaysFollowupLeads:", error);
    throw error; // You might want to handle or log the error appropriately
  }
};

const getLeadsCount = async (filter) => {
  const userStatuses = await status.find(filter);

  const statusMap = {};

  userStatuses.forEach((item) => {
    statusMap[item.StatusName] = {
      _id: item._id,
      StatusIcon: item.StatusIcon || null,
      StatusColor: item.StatusColor || null,
    };
  });

  // console.log("myfilters---", filter);
  // console.log("userstara---", userStatuses);

  // Define the facets based on the StatusName.
  const facetStages = {};

  Object.keys(statusMap).forEach((statusName) => {
    facetStages[statusName] = [
      {
        $match: {
          statusId: statusMap[statusName]._id,
        },
      },
    ];
  });

  console.log("facetStages----", facetStages);

  const aggregationResult = await leads.aggregate([
    {
      $facet: facetStages,
    },
    // {
    // $project: {
    //   ...Object.keys(facetStages).reduce((acc, key) => {
    //     acc[key] = { $size: `$${key}` };
    //     return acc;
    //   }, {}),
    //   Price: 1,
    // },
    // },
  ]);

  //   let totalLeadsCount = 0

  // for (const key in aggregationResult[0]) {
  //   if (Object.hasOwnProperty.call(aggregationResult[0], key)) {
  //     totalLeadsCount += aggregationResult[0][key];
  //   }
  // }

  //   const result = {
  //     totalLeads: totalLeadsCount,
  //     ...aggregationResult[0],
  //   };
  const data = [];
  console.log("leadssdadasda-------", aggregationResult);

  for (const statusName in aggregationResult[0]) {
    const statusArray = aggregationResult[0][statusName];
    const priceSum = statusArray.reduce(
      (sum, item) => sum + (item.CoursePrice || 0),
      0
    );
    data.push({
      name: statusName,
      count: statusArray.length,
      price: priceSum,
      icon: statusMap[statusName].StatusIcon,
      color: statusMap[statusName].StatusColor,
    });
  }

  //total
  let totalLeads = 0;
  let totalPrice = 0;
  data.map((item) => {
    totalLeads = totalLeads + item.count;
    totalPrice = totalPrice + item.price;
  });
  data.splice(0, 0, { name: "Total", count: totalLeads, price: totalPrice });

  return data;
};

const getLeadLogs = async (leadId) => {
  return await leads.aggregate([
    {
      $match: {
        _id: new ObjectId(leadId),
      },
    },
    {
      $project: {
        _id: 1,
        Name: 1,
        Phone1: 1,
        Phone2: 1,
        Email: 1,
        City: 1,
        Course: 1,
        CoursePrice: 1,
        AssignTo: 1,
        Status: 1,
        Remark: 1,
        EnquiryDate: 1,
        FollowupDate: 1,
        Source: 1,
        LogType: 1,
        Remarks: 1,
      },
    },
  ]);
};
const getAllLeads = async () => {
  return await leads.find();
};

const getAllLeads1 = async () => {
  // const leads = await leadsInfo.aggregate([
  const myleads = await leads.aggregate([
    {
      $match: {},
    },
  ]);

  return myleads;
};
const getTodayLeadss = async () => {
  var start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  var end = new Date();
  end.setUTCHours(23, 59, 59, 999);

  let filter = {};

  filter["EnquiryDate"] = {
    $gte: start,
    $lte: end,
  };
  return await leadsInfo.aggregate([
    {
      $match: filter,
    },
  ]);
  return leadsInfo.find({
    EnquiryDate: ISODate("2023-07-12T00:00:00.000+00:00"),
  });
};
const getTodayLeads = async () => {
  return leads.aggregate([
    {
      $match: {
        EnquiryDate: {
          $gte: new Date("Mon, 15 May 2023 00:00:00 GMT"),
          $lte: new Date("Fri, 26 May 2023 23:59:59 GMT"),
        },
      },
    },
    {
      $sort: {
        EnquiryDate: 1,
      },
    },
  ]);
};

const searchDuplicateLeads = async (filter) => {
  return await leads.aggregate([
    {
      $match: filter,
    },
    {
      $lookup: {
        from: "users",
        localField: "parentId",
        foreignField: "_id",
        as: "ParentInfo",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignId",
        foreignField: "_id",
        as: "AssignInfo",
      },
    },
    {
      $lookup: {
        from: "sources",
        localField: "sourceId",
        foreignField: "_id",
        as: "SourceInfo",
      },
    },
    {
      $lookup: {
        from: "cities",
        localField: "cityId",
        foreignField: "_id",
        as: "CityInfo",
      },
    },
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "CourseInfo",
      },
    },
    {
      $lookup: {
        from: "status",
        localField: "statusId",
        foreignField: "_id",
        as: "StatusInfo",
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "branchId",
        foreignField: "_id",
        as: "BranchInfo",
      },
    },
    {
      $project: {
        _id: 1,
        UID: 1,
        StatusInfo: 1,
        BranchInfo: 1,
        CourseInfo: 1,
        CityInfo: 1,
        AssignInfo: {
          _id: 1,
          Name: 1,
          UserName: 1,
          Email: 1,
        },
        ParentInfo: {
          _id: 1,
          Name: 1,
          UserName: 1,
          Email: 1,
        },
        Name: 1,
        EnquiryDate: 1,
        CoursePrice: 1,
        Phone1: 1,

        Phone2: 1,
        Email: 1,
        FollowupDate: 1,
        Days: 1,
        Days2: 1,
      },
    },
  ]);
};

// const getNewLeads = async (filter, options) => {
//   //calculate current date and subtract -1 fro getting yesterday date
//   let curDate = new Date();
//   curDate.setDate(curDate.getDate() - 1);

//   var aggregate = leads.aggregate([
//     {
//       $match: filter,
//     },
//     {
//       $addFields: {
//         FollowupDate: {
//           $convert: {
//             input: "$FollowupDate",
//             to: "date",
//             onError: new Date(), // Default value in case of conversion error
//           },
//         },
//         // daysss: {
//           Days:{
//           $floor: {
//             $divide: [
//               { $subtract: [{ $toDate: "$FollowupDate" }, curDate] },
//               1000 * 60 * 60 * 24,
//             ],
//           },
//         },
//       },
//     },
//     {
//       $sort: {
//         createdAt: -1,
//       },
//     },
//     {
//       $project: {
//         UID: 1,
//         AssignTo: 1,
//         Source: 1,
//         City: 1,
//         Status: 1,
//         EnquiryDate: 1,
//         Name: 1,
//         Phone1: 1,
//         Phone2: 1,
//         // Course: "$EnquiryCourse",
//         Course: 1,
//         CoursePrice: 1,
//         Days2: 1,
//         parentId:1,
//         // daysss: 1,
//         Days:1,
//         FollowupDate: 1,
//       },
//     },
//   ]);

//  return await leads.aggregatePaginate(aggregate, options);
// };

const getNewLeads = async (filter, options) => {
  // Calculate the current date and subtract -1 to get yesterday's date
  let curDate = new Date();
  curDate.setDate(curDate.getDate() - 1);
  console.log("---", filter);
  var aggregate = leads.aggregate([
    {
      $match: filter,
    },
    {
      $addFields: {
        FollowupDate: {
          $convert: {
            input: "$FollowupDate",
            to: "date",
            onError: new Date(), // Default value in case of conversion error
          },
        },
        Days: {
          $floor: {
            $divide: [
              { $subtract: [{ $toDate: "$FollowupDate" }, curDate] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: "users", // Replace with your actual collection name for assignments
        localField: "assignId", // Field in the leads collection
        foreignField: "_id", // Field in the assign collection
        as: "AssignInfo",
      },
    },
    {
      $lookup: {
        from: "sources",
        localField: "sourceId",
        foreignField: "_id",
        as: "SourceInfo",
      },
    },
    {
      $lookup: {
        from: "cities",
        localField: "cityId",
        foreignField: "_id",
        as: "CityInfo",
      },
    },
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "CourseInfo",
      },
    },
    {
      $lookup: {
        from: "status",
        localField: "statusId",
        foreignField: "_id",
        as: "StatusInfo",
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "branchId",
        foreignField: "_id",
        as: "BranchInfo",
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        UID: 1,
        // AssignTo: 1,
        // Source: 1,
        // City: 1,
        // Status: 1,
        EnquiryDate: 1,
        Name: 1,
        Email: 1,
        Phone1: 1,
        Phone2: 1,
        location: 1,
        Course: 1,
        CoursePrice: 1,
        Days: 1,
        FollowupDate: 1,
        AssignInfo: { $arrayElemAt: ["$AssignInfo", 0] },
        SourceInfo: { $arrayElemAt: ["$SourceInfo", 0] },
        CityInfo: { $arrayElemAt: ["$CityInfo", 0] },
        CourseInfo: { $arrayElemAt: ["$CourseInfo", 0] },
        StatusInfo: { $arrayElemAt: ["$StatusInfo", 0] },
        BranchInfo: { $arrayElemAt: ["$BranchInfo", 0] },
      },
    },
  ]);

  return await leads.aggregatePaginate(aggregate, options);
};

module.exports = {
  addLead,
  updateLead,
  deleteLead,
  getLeads,
  addLeadLogs,
  getLeadsByEmailOrPhone,
  getDuplicateLeads,
  TodaysFollowupLeads,
  getLeadsCount,
  getLeadById,
  getLeadLogs,
  getAllLeads,
  getTodayLeads,
  getAllLeads1,
  searchDuplicateLeads,
  getNewLeads,
  getTodayLeadss,
};
