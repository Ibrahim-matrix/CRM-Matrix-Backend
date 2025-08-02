// const leads = require("../models/lead.model");
const httpStatus = require("http-status");
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const { leadService, userService } = require("../services");
const CourseModel = require("../models/course.model");
const BranchModel = require("../models/branch.model");
const UsersModel = require("../models/user.model");
const { branch } = require("../models");
const indiamartleads = require("../models/indiamart.lead.model");
const notifications = require("../models/notification.model");
const pick = require("../utils/pick");
const { object } = require("joi");
const { addLeadToAlgolia } = require("../utils/Algolia");
const { ObjectId } = require("mongodb");
const axios = require("axios");
const { fi } = require("faker/lib/locales");
var CronJob = require("cron").CronJob;
const { users } = require("../models");
const { leads } = require("../models");
const { identity } = require("rxjs");

const addLead = catchAsync(async (req, res) => {
  req.body["Remark"] = req.body.Remarks;

  delete req.body.Remarks;
  let totalDocuments = 0;
  let prefix;

  if (req.user.UserType == 2) {
    req.body["parentId"] = req.user.userId;
    totalDocuments = await leads.countDocuments({ parentId: req.user.userId });
    const data = await users.findOne({ _id: req.user.userId });
    prefix = data.companyName.slice(0, 3).toUpperCase();
  } else if (req.user.UserType == 3) {
    req.body["parentId"] = req.user.parentId;
    req.body["userId"] = req.user._id;
    totalDocuments = await leads.countDocuments({
      parentId: req.user.parentId,
    });
    const data = await users.findOne({ _id: req.user.parentId });

    prefix = data.companyName.slice(0, 3).toUpperCase();
  } else {
    return res.status(401).json({
      message: " Unauthorized!!",
    });
  }
  const nextEnrollmentNumber = (totalDocuments + 1).toString().padStart(3, "0");
  req.body.UID = prefix + "-" + String(nextEnrollmentNumber);

  let addLead = await leadService.addLead(req.body);
  const user = await userService.getUserById(req.body.assignId);
  console.log(user);
  if (user) {
    await notifications.create({
      userId: user._id,
      message: "Lead has been assigned to you!",
    });
  }

  return res.status(httpStatus.CREATED).json({
    message: "Lead created successfully!!",
    Data: addLead,
  });
});

const updateLead = catchAsync(async (req, res) => {
  req.body["Name"] = req.user.Name;
  const updatedLead = await leadService.updateLead(
    req.params.id,
    req.body,
    res
  );
  return res.status(httpStatus.OK).json({
    message: "Lead updated successfully!!",
    Data: updatedLead,
  });
});

const deleteLead = catchAsync(async (req, res) => {
  if (req.user.UserType === 3) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: "permission denied",
    });
  }
  const deletedLead = await leadService.deleteLead(req.params.id);
  return res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: "Lead deleted successfully!!",
    Data: deletedLead,
  });
});

const getLeads = catchAsync(async (req, res) => {
  try {
    const options = pick(req.query, ["sortBy", "limit", "page"]);

    let { City, Source, Course, Status, Branch, AssignTo, keyword, ...rest } =
      req.query;

    const filter = { ...rest };
    // if (!Status) {
    //   return res.status(400).json({
    //     message: "status is required",
    //   });
    // }

    let dynamicObj = {
      $and: [],
    };
    if (req.user.UserType == 1) {
      console.log("herer");
      filter["parentId"] = new ObjectId(req.query.parentId);
      dynamicObj.$and.push({
        $or: [{ parentId: { $in: [new ObjectId(req.query.parentId)] } }],
      });
    }
    if (req.user.UserType == 2) {
      filter["parentId"] = new ObjectId(req.user.userId);
      dynamicObj.$and.push({
        $or: [{ parentId: { $in: [new ObjectId(req.user.userId)] } }],
      });
    }
    if (req.user.UserType == 3) {
    }

    // dynamicObj.$and.push({
    //   $or: [{ Status: { $in: ["Open", "Final Lead", "Hot Lead"] } }],
    // });
    if (req.user.role === 3) {
      let arr = [];
      arr.push(req.user.Name);

      if (req.user.Permission.length == 0) {
        let selfLeads = await leads.findOne({ AssignTo: req.user.Name });
        if (selfLeads) {
          dynamicObj.$and.push({
            AssignTo: { $in: arr },
          });
        } else {
          return res.status(200).json({
            data: [],
          });
        }
      }
      if (req.user.Permission.length > 0) {
        for (let permissionId of req.user.Permission) {
          let user = await userService.getUserById(permissionId);
          if (user) {
            arr.push(user.Name);
          }
        }
        //arr.push(req.user.Permission);
        dynamicObj.$and.push({
          AssignTo: { $in: arr },
        });
      }
    } else {
      if (AssignTo) {
        dynamicObj.$and.push({
          AssignTo: { $in: AssignTo.split(",") },
        });
      }
    }

    if (Status) {
      dynamicObj.$and.push({
        $or: [{ Status: { $in: Status.split(",") } }],
      });
    }
    if (keyword) {
      // let arr = [];
      // if (req.user.role === "user") {
      //   if (req.user.Permission.length == 0) {
      //     keyword = "";
      //   }
      //   if (req.user.Permission.length > 0) {
      //     for (let permissionId of req.user.Permission) {
      //       let user = await userService.getUserById(permissionId);
      //       if (user) {
      //         arr.push(user.Name);
      //       }
      //     }
      //     dynamicObj.$and.push({
      //       AssignTo: { $in: arr },
      //     });
      //   }
      // }
      const searchKeywords = [
        "Name",
        "City",
        "Address",
        "CreatedBy",
        "Phone1",
        "Phone2",
        "Email",
        "AssignTo",
        "Source",
        "Course",
        "Status",
        "Branch",
        "Remark",
        "Remarks",
        "prevStatus",
        "prevCourse",
        "prevPrice",
        "whoChangesState",
        "LogType",
        "InformationDate",
      ];

      dynamicObj.$and = [
        {
          $or: searchKeywords.map((field) => ({
            [field]: { $regex: keyword, $options: "i" },
          })),
        },
      ];
    }

    if (City) {
      dynamicObj.$and.push({
        City: { $in: City.split(",") },
      });
    }
    // if (EnquiryCourse) {
    //         dynamicObj.$and.push({
    //           EnquiryCourse: { $in: City.split(",") },
    //         });
    // }
    if (Source) {
      dynamicObj.$and.push({
        Source: { $in: Source.split(",") },
      });
    }
    if (Course) {
      dynamicObj.$and.push({
        Course: { $in: Course.split(",") },
      });
    }
    if (Branch) {
      dynamicObj.$and.push({
        Branch: { $in: Branch.split(",") },
      });
    }
    if (filter.EnquiryDate) {
      const isoDateString1 = filter.EnquiryDate.gte;
      const isoDateString2 = filter.EnquiryDate.lte;

      const date1 = new Date(isoDateString1);
      const date2 = new Date(isoDateString2);

      dynamicObj.$and.push({
        EnquiryDate: {
          $gte: new Date(date1),
          $lt: new Date(date2),
        },
      });
    }
    if (filter.FollowupDate) {
      const isoDateString1 = filter.FollowupDate.gte;
      const isoDateString2 = filter.FollowupDate.lte;

      const date1 = new Date(isoDateString1);
      const date2 = new Date(isoDateString2);

      dynamicObj.$and.push({
        FollowupDate: {
          $gte: date1,
          $lt: date2,
        },
      });
    }

    delete filter.limit;
    delete filter.page;

    const leadss = await leadService.getLeads(dynamicObj, options);
    const { docs, ...otherFields } = leadss;
    return res.status(httpStatus.OK).json({
      message: "success!!",
      Data: docs,
      ...otherFields,
    });
  } catch (error) {}
});

const getLeadById = catchAsync(async (req, res) => {
  try {
    let obj = {};
    const lead = await leadService.getLeadById(req.params.id);
    obj = lead;
    delete obj.Branch;

    if (!lead) {
      return res.status(400).json({
        message: "lead not found",
      });
    }
    const {
      LogType,
      Remarks,
      whoChangesState,
      prevCourse,
      prevPrice,
      prevStatus,
      prevStatusDate,
      InformationDate,
      logAddedBy,
      PrevFollowupDate,
      FollowupChangeBy,
      FollowupChangeAt,
    } = lead;
    const leadLogss = [];
    const prevCourses = [];
    const prevStatusHistory = [];

    if (LogType?.length > 0 && Remarks?.length > 0) {
      for (let index = 0; index < LogType.length; index++) {
        const num1 = LogType[index];
        const num2 = Remarks[index];
        const num3 = logAddedBy[index];
        const num4 = InformationDate[index];
        leadLogss.push({
          LogType: num1,
          Remarks: num2,
          createdBy: num3,
          createdAt: num4,
        });
      }
    }

    // if (prevCourse?.length > 0 && prevPrice?.length > 0) {
    //   for (let index = 0; index < prevCourse.length; index++) {
    //     const num3 = prevCourse[index];
    //     const num4 = prevPrice[index];
    //     const num5 = logAddedBy[index];
    //     prevCourses.push({
    //       prevCourse: num3,
    //       prevPrice: num4,
    //     });
    //   }
    // }

    const productHistory = [];

    if (lead.productHistory?.length > 0) {
      for (const item of lead.productHistory) {
        productHistory.push({
          courseName: item.courseName,
          coursePrice: item.coursePrice,
          createdBy: item.changedBy,
          createdAt: item.changedAt,
        });
      }
    }

    if (prevStatus?.length > 0 && prevStatusDate?.length > 0) {
      for (let index = 0; index < prevStatus.length; index++) {
        const num1 = prevStatus[index];
        const num2 = prevStatusDate[index];
        const num3 = whoChangesState[index];
        //const num3 = whoChangesState[index];
        prevStatusHistory.push({
          status: num1,
          createdAt: num2,
          createdBy: num3,
        });
      }
    }

    const prevFollowups = [];

    if (PrevFollowupDate?.length > 0) {
      for (let i = 0; i < PrevFollowupDate.length; i++) {
        prevFollowups.push({
          date: PrevFollowupDate[i],
          changedBy: FollowupChangeBy?.[i] || "Unknown",
          changedAt: FollowupChangeAt?.[i] || null,
        });
      }
    }

    return res.status(200).json({
      message: "success",
      Data: lead,
      leadLogss,
      prevCourses: productHistory,
      prevStatusHistory,
      prevFollowups,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

const getUserLeads = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const newleads = await leads.find({ assignId: id });
    let obj = { ...newleads };
    delete obj.Branch;

    if (newleads.length == 0) {
      return res.status(400).json({
        success: false,
        message: "leads not found",
      });
    }

    let myLeads = [];

    newleads.map((lead) => {
      const {
        LogType,
        Remarks,
        whoChangesState,
        prevCourse,
        prevPrice,
        prevStatus,
        prevStatusDate,
        InformationDate,
        logAddedBy,
      } = lead;
      const leadLogss = [];
      const prevCourses = [];
      const prevStatusHistory = [];

      if (LogType.length > 0 && Remarks.length > 0) {
        for (let index = 0; index < LogType.length; index++) {
          const num1 = LogType[index];
          const num2 = Remarks[index];
          const num3 = logAddedBy[index];
          const num4 = InformationDate[index];
          leadLogss.push({
            LogType: num1,
            Remarks: num2,
            createdBy: num3,
            createdAt: num4,
          });
        }
      }

      if (prevCourse.length > 0 && prevPrice.length > 0) {
        for (let index = 0; index < prevCourse.length; index++) {
          const num3 = prevCourse[index];
          const num4 = prevPrice[index];
          prevCourses.push({
            prevCourse: num3,
            prevPrice: num4,
          });
        }
      }

      if (prevStatus.length > 0 && prevStatusDate.length > 0) {
        for (let index = 0; index < prevStatus.length; index++) {
          const num1 = prevStatus[index];
          const num2 = prevStatusDate[index];
          const num3 = whoChangesState[index];
          //const num3 = whoChangesState[index];
          prevStatusHistory.push({
            status: num1,
            createdAt: num2,
            createdBy: num3,
          });
        }
      }

      myLeads.push({
        lead,
        leadLogss,
        prevCourses,
        prevStatusHistory,
      });
    });

    return res.status(200).json({
      success: false,
      Data: myLeads,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

const getAssignUserLeads = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const newleads = await leads.find({ assignId: id });
    let obj = { ...newleads };
    delete obj.Branch;

    if (newleads.length == 0) {
      return res.status(400).json({
        success: false,
        message: "leads not found",
      });
    }

    let myLeads = [];

    newleads.map((lead) => {
      const {
        LogType,
        Remarks,
        whoChangesState,
        prevCourse,
        prevPrice,
        prevStatus,
        prevStatusDate,
        InformationDate,
        logAddedBy,
      } = lead;
      const leadLogss = [];
      const prevCourses = [];
      const prevStatusHistory = [];

      if (LogType.length > 0 && Remarks.length > 0) {
        for (let index = 0; index < LogType.length; index++) {
          const num1 = LogType[index];
          const num2 = Remarks[index];
          const num3 = logAddedBy[index];
          const num4 = InformationDate[index];
          leadLogss.push({
            LogType: num1,
            Remarks: num2,
            createdBy: num3,
            createdAt: num4,
          });
        }
      }

      if (prevCourse.length > 0 && prevPrice.length > 0) {
        for (let index = 0; index < prevCourse.length; index++) {
          const num3 = prevCourse[index];
          const num4 = prevPrice[index];
          prevCourses.push({
            prevCourse: num3,
            prevPrice: num4,
          });
        }
      }

      if (prevStatus.length > 0 && prevStatusDate.length > 0) {
        for (let index = 0; index < prevStatus.length; index++) {
          const num1 = prevStatus[index];
          const num2 = prevStatusDate[index];
          const num3 = whoChangesState[index];
          //const num3 = whoChangesState[index];
          prevStatusHistory.push({
            status: num1,
            createdAt: num2,
            createdBy: num3,
          });
        }
      }

      myLeads.push({
        lead,
        leadLogss,
        prevCourses,
        prevStatusHistory,
      });
    });

    return res.status(200).json({
      success: false,
      Data: myLeads,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

const getNewLeads = catchAsync(async (req, res) => {
  const {
    keyword,
    // City,
    // Course,
    // Status,
    // Branch,
    // AssignTo,
    // Source,
    cityId,
    courseId,
    statusId,
    branchId,
    assignId,
    sourceId,
    EnquiryStartDate,
    EnquiryEndDate,
    FollowupStartDate,
    FollowupEndDate,
  } = req.query;
  console.log(req.query);

  let filter = {};
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  if (req.user.UserType == 1) {
    Object.assign(filter, {
      parentId: new ObjectId(req.query.parentId),
    });
  }
  if (req.user.UserType == 2) {
    Object.assign(filter, {
      parentId: new ObjectId(req.user.userId),
    });
  }
  // if (req.user.UserType == 3) {
  //   let userIds = [];
  //   userIds.push(new ObjectId(req.user._id));
  //   if (req.user.Permission?.length > 0) {
  //     for (let userId of req.user.Permission) {
  //       userIds.push(new ObjectId(userId));
  //     }
  //   }
  //   Object.assign(filter, {
  //     parentId: new ObjectId(req.user.parentId),
  //     userId: { $in: userIds },
  //   });
  // }
  if (req.user.UserProfile == "User") {
    Object.assign(filter, {
      assignId: new ObjectId(req.user.userId),
    });
  }

  if (req.user.UserProfile === "Manager" || req.user.UserProfile === "Custom") {
    // if (Array.isArray(req.user.Branch) && req.user.Branch.length > 0) {
    //   const branchesid = await branch.find({
    //     BranchName: { $in: req.user.Branch.map(name => name.trim()) },
    //     parentId: req.user.parentId // optional: to ensure it's for this user's parent
    //   });
    //   const branchIds = branchesid.map(branch => branch._id);
    //   console.log(branchIds)
    //   if (branchIds.length > 0) {
    //     Object.assign(filter, {
    //       parentId: new ObjectId(req.user.parentId),
    //       branchId: { $in: branchIds }, // Note: case-sensitive match
    //     });
    //   } else {
    //     return res.status(200).json({ message: [] });
    //   }
    // }

    if (Array.isArray(req.user.Permission) && req.user.Permission.length > 0) {
      const permittedUserId = req.user.Permission.map((p) => p.userId);

      permittedUserId.push(req.user.userId);

      filter = {
        parentId: req.user.parentId,
        assignId: { $in: permittedUserId },
      };
    } else {
      return res.status(200).json({ message: [] });
    }
  }
  // console.log("FILTER BEFORE CALLING SERVICE =>", req.user.Branch);

  if (cityId) {
    Object.assign(filter, {
      cityId: { $in: cityId.split(",").map((item) => new ObjectId(item)) },
    });
  }
  if (courseId) {
    Object.assign(filter, {
      courseId: { $in: courseId.split(",").map((item) => new ObjectId(item)) },
    });
  }
  if (statusId) {
    Object.assign(filter, {
      statusId: { $in: statusId.split(",").map((item) => new ObjectId(item)) },
    });
  }
  if (branchId) {
    Object.assign(filter, {
      branchId: { $in: branchId.split(",").map((item) => new ObjectId(item)) },
    });
  }
  if (sourceId) {
    Object.assign(filter, {
      sourceId: { $in: sourceId.split(",").map((item) => new ObjectId(item)) },
    });
  }
  if (assignId) {
    Object.assign(filter, {
      assignId: { $in: assignId.split(",").map((item) => new ObjectId(item)) },
    });
  }
  if (EnquiryStartDate && EnquiryEndDate) {
    const isoStartDate = EnquiryStartDate;
    const isoEndDate = EnquiryEndDate;

    const startDate = new Date(isoStartDate);
    let endDate = new Date(isoEndDate);
    endDate.setDate(endDate.getDate() + 1);

    Object.assign(filter, {
      EnquiryDate: {
        $gte: startDate,
        $lte: endDate,
      },
    });
  }

  if (FollowupStartDate && FollowupEndDate) {
    const isoStartDate = FollowupStartDate;
    const isoEndDate = FollowupEndDate;

    const startDate = new Date(isoStartDate);
    let endDate = new Date(isoEndDate);
    endDate.setDate(endDate.getDate() + 1);

    Object.assign(filter, {
      FollowupDate: {
        $gte: startDate,
        $lte: endDate,
      },
    });
  }

  // console.log('filter', filter);
  // console.log('options', options);

  const leadss = await leadService.getNewLeads(filter, options);

  const { docs, ...otherFields } = leadss;
  return res.status(httpStatus.OK).json({
    message: "success!!",
    Data: docs,
    ...otherFields,
  });
});
// const getLeads = catchAsync(async (req, res) => {
//   let filter = {};
//   if (req.query._id) {
//     filter["_id"] = req.query._id;
//   }

//   const leads = await leadService.getLeads(filter);
//   return res.status(httpStatus.OK).json({
//     message: "success!!",
//     Data: leads,
//   });
// });
const getCourse_Branch_UserData = catchAsync(async (req, res) => {
  try {
    const [course, branch, users] = await Promise.all([
      CourseModel.find({})
        .lean()
        .exec()
        .catch((err) => {
          throw err;
        }),
      BranchModel.find({})
        .lean()
        .exec()
        .catch((err) => {
          throw err;
        }),
      UsersModel.find({})
        .lean()
        .exec()
        .catch((err) => {
          throw err;
        }),
    ]);
    const data = { course, branch, users };
    return res.status(httpStatus.CREATED).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const addLeadLogs = catchAsync(async (req, res) => {
  const { leadId } = req.body;
  const lead = await leadService.getLeadById(leadId);
  if (!lead) {
    return res.status(400).json({
      message: "lead not found!",
    });
  }
  req.body["name"] = req.user.name;
  await leadService.addLeadLogs(leadId, req.body);
  return res.status(httpStatus.CREATED).json({
    message: "success",
  });
});

const getDuplicateLeads = catchAsync(async (req, res) => {
  const { Email, Phone1, Phone2 } = req.body;
  let filter = {
    $or: [],
  };
  if (Email) {
    filter.$or.push({
      Email: Email,
    });
  }
  if (Phone1) {
    filter.$or.push({
      Phone1: Phone1,
    });
  }
  if (Phone2) {
    filter.$or.push({
      Phone2: Phone2,
    });
  }
  const lead = await leadService.getDuplicateLeads(filter);

  if (lead.length > 0) {
    return res.status(403).json({
      message: "lead already exists!!",
      lead: lead,
    });
  } else {
    return res.status(200).json({
      lead: [],
    });
  }
});

const TodaysFollowupLeads = catchAsync(async (req, res) => {
  if (req.user.role == "admin") {
    return res.status(200).json({
      message: [],
    });
  }
  const options = pick(req.query, ["sortBy", "limit", "page"]);

  var start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  var end = new Date();
  end.setUTCHours(23, 59, 59, 999);

  let filter = {
    $and: [],
    parentId: new ObjectId(req.user.parentId),
  };

  filter["FollowupDate"] = {
    $gte: start,
    $lte: end,
  };

  let arr = [];
  if (req.user.UserProfile === "User") {
    if (req.user.Permission.length == 0) {
      let selfLeads = await leads.findOne({ assignId: req.user.userId });
      if (selfLeads) {
        arr.push(new ObjectId(req.user.userId));
        // filter.$and.push({
        //   AssignTo: { $in: arr },
        // });
      } else {
        return res.status(200).json({
          data: [],
        });
      }
    }
    if (req.user.Permission.length > 0) {
      for (let permissionId of req.user.Permission) {
        // let user = await userService.getUserById(permissionId);
        // if (user) {
        // arr.push(user.Name);
        // }

        arr.push(new ObjectId(permissionId));
      }
      filter.$and.push({ assignId: { $in: arr } });
    }

    if (arr.length > 0) {
      filter.$and.push({ assignId: { $in: arr } });
    }
  }

  // Manager - Branch filter
  if (req.user.UserProfile === "Manager") {
    console.log("2222222222222222222222222222222222222222222222222");
    const branchDocs = await branch.find({
      BranchName: { $in: req.user.Branch },
      parentId: new ObjectId(req.user.parentId),
    });

    console.log(
      branchDocs,
      "================================================++++++++++++++++==============="
    );

    const branchIds = branchDocs.map((b) => b._id);
    if (branchIds.length > 0) {
      filter.$and.push({ branchId: { $in: branchIds } });
    }
  }

  console.log("MYFILTER", filter);
  const leadss = await leadService.TodaysFollowupLeads(filter, options);

  const { docs, ...otherFields } = leadss;
  return res.status(httpStatus.OK).json({
    message: "success!!",
    Data: docs,
    ...otherFields,
  });
});

const getLeadLogs = catchAsync(async (req, res) => {
  const { leadId } = req.body;

  const lead = await leadService.getLeadById(leadId);
  if (!lead) {
    return res.status(400).json({
      message: "lead not found!",
    });
  }

  const leadLogs = await leadService.getLeadLogs(leadId);
  const { LogType, Remarks } = leadLogs;

  let leadLogss = [];

  LogType.forEach((num1, index) => {
    const num2 = Remarks[index];
    leadLogss.push({
      LogType: num1,
      Remarks: num2,
    });
  });

  leadLogs[0]["leadLogss"] = leadLogss;
  return res.status(200).json({
    message: "success",
    Data: leadLogs,
  });
});

const searchDuplicateLeads = catchAsync(async (req, res) => {
  let { keyword } = req.query;

  if (!keyword) {
    return res.status(httpStatus.OK).json({
      message: "success",
      Data: [],
    });
  }

  let filter = {};
  if (req.user.UserType == 2) {
    Object.assign(filter, {
      parentId: new ObjectId(req.user.userId),
    });
  }
  if (req.user.UserType == 3) {
    Object.assign(filter, {
      parentId: new ObjectId(req.user.parentId),
    });
  }

  const matchQuery = {
    $and: [
      {
        $or: [
          {
            Email: {
              $regex: keyword,
              $options: "i",
            },
          },
          {
            Phone1: {
              $regex: keyword,
              $options: "i",
            },
          },
          {
            Phone2: {
              $regex: keyword,
              $options: "i",
            },
          },
        ],
      },
      {
        parentId: filter.parentId,
      },
    ],
  };

  const searchedLeads = await leadService.searchDuplicateLeads(matchQuery);
  return res.status(httpStatus.OK).json({
    message: "success",
    Data: searchedLeads,
  });
});

const formatedDate = async () => {
  let amTime = "09:00:00";
  let pmTime = "13:00:00";
  let firstDay = new Date();

  let sixthDay = new Date();
  sixthDay.setDate(firstDay.getDate() + 4);

  // Add leading zeroes to day and month components
  let formattedStartTime =
    (firstDay.getDate() < 10 ? "0" : "") +
    firstDay.getDate() +
    "-" +
    (firstDay.getMonth() + 1 < 10 ? "0" : "") +
    (firstDay.getMonth() + 1) +
    "-" +
    firstDay.getFullYear() +
    " " +
    amTime;

  // Add leading zeroes to day and month components
  let formattedEndTime =
    (sixthDay.getDate() < 10 ? "0" : "") +
    sixthDay.getDate() +
    "-" +
    (sixthDay.getMonth() + 1 < 10 ? "0" : "") +
    (sixthDay.getMonth() + 1) +
    "-" +
    sixthDay.getFullYear() +
    " " +
    pmTime;
  return {
    startTime: formattedStartTime,
    endTime: formattedEndTime,
  };
};

const recieveIndiaMartLeads = async () => {
  try {
    const getFormatedDate = await formatedDate();

    let allUsers = await users.find({ crmKey: { $ne: null }, UserType: 2 });

    // console.log("---------", allUsers);
    allUsers.map(async (item) => {
      let url;
      if (!item.lastLeadFetchDate) {
        url = `https://mapi.indiamart.com/wservce/crm/crmListing/v2/?glusr_crm_key=${item.crmKey}=&start_time=${getFormatedDate.startTime}&end_time=${getFormatedDate.endTime}`;
      } else {
        url = `https://mapi.indiamart.com/wservce/crm/crmListing/v2/?glusr_crm_key=${item.crmKey}=`;
      }

      // const url = `https://mapi.indiamart.com/wservce/crm/crmListing/v2/?glusr_crm_key=${process.env.GLUSR_CRM_KEY}=&start_time=${getFormatedDate.startTime}&end_time=${getFormatedDate.endTime}`;

      const response = await axios.get(url);
      console.log(
        `url-
    
       ------> `,
        url
      );
      const leads = response.data.RESPONSE;

      // console.log("lead------------->", leads);

      leads.forEach(async (lead) => {
        const existingLead = await indiamartleads.findOne({
          UNIQUE_QUERY_ID: lead.UNIQUE_QUERY_ID,
        });
        if (!existingLead) {
          lead["PARENT_ID"] = item._id;
          let addLead = await indiamartleads.create(lead);
          await users.findByIdAndUpdate(item._id, {
            lastLeadFetchDate: new Date(),
          });
        }
      });
    });
  } catch (err) {
    console.log(err);
  }
};

const getAllUserLeads = async (req, res) => {
  try {
    const { id } = req.params;
    let user = await users.findOne({
      _id: id,
      crmKey: { $ne: null },
      UserType: 2,
    });
    console.log("user", user);
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Unauthorized",
      });
    }

    const allLeads = await indiamartleads.find({ PARENT_ID: id });

    return res.status(200).send({
      success: true,
      // message: "Leads added successfully",
      Data: allLeads,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      success: false,
      message: err.message,
    });
  }
};

const getUserLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    let user = await users.findOne({
      _id: req.user.userId,
      crmKey: { $ne: null },
      UserType: 2,
    });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Unauthorized",
      });
    }

    const lead = await indiamartleads.findById(id);

    return res.status(200).send({
      success: true,
      // message: "Leads added successfully",
      Data: lead,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      success: false,
      message: err.message,
    });
  }
};

const recieveIndiaMartLead = async (req, res) => {
  try {
    const { id } = req.params;

    let user = await users.findOne({
      _id: id,
      crmKey: { $ne: null },
      UserType: 2,
    });
    console.log("user", user);
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Unauthorized",
      });
    }
    let url;
    if (!user.lastLeadFetchTime) {
      const getFormatedDate = await formatedDate();
      url = `https://mapi.indiamart.com/wservce/crm/crmListing/v2/?glusr_crm_key=${user.crmKey}=&start_time=${getFormatedDate.startTime}&end_time=${getFormatedDate.endTime}`;
    } else {
      const now = Date.now();
      const timeDifference = now - user.lastLeadFetchTime;
      // 5 minutes in milliseconds
      const fiveMinutes = 5 * 60 * 1000;

      if (timeDifference < fiveMinutes) {
        return res.status(429).send({
          success: false,
          message:
            "Please wait at least 5 minutes before fetching leads again.",
        });
      }

      url = `https://mapi.indiamart.com/wservce/crm/crmListing/v2/?glusr_crm_key=${user.crmKey}=`;
    }

    console.log(url);

    const response = await axios.get(url);
    const leads = response.data.RESPONSE;
    console.log("----------uyes--------------", leads);

    leads.forEach(async (lead) => {
      const existingLead = await indiamartleads.findOne({
        UNIQUE_QUERY_ID: lead.UNIQUE_QUERY_ID,
      });
      if (!existingLead) {
        lead["PARENT_ID"] = user._id;
        let addLead = await indiamartleads.create(lead);
        //  await users.findByIdAndUpdate(user._id,{lastLeadFetchTime: Date.now()})
      }
    });

    user.lastLeadFetchTime = Date.now();
    await user.save();

    return res.status(200).send({
      success: true,
      message: "Leads added successfully",
      leads,
    });
  } catch (err) {
    return res.status(400).send({
      success: false,
      message: err.message,
    });
  }
};

// const job = new CronJob("*/10 * * * *", async function () {
//   console.log("cron running every 10 minute");
//   try {
//    await recieveIndiaMartLeads();
//   } catch (err) {
//     console.error("errpr occured");
//   }
// });
// job.start();

const job = new CronJob("0 */3 * * *", async function () {
  console.log("cron running every 3 hrs", new Date());
  try {
    recieveIndiaMartLeads();
  } catch (err) {
    console.error(err);
  }
});
job.start();

const assignLeadToUser = catchAsync(async (req, res) => {
  const {
    leadId,
    userId,
    assignId,
    courseId,
    branchId,
    statusId,
    sourceId,
    cityId,
    CoursePrice,
    Email,
    EnquiryDate,
    FollowupDate,
    Name,
    Phone1,
    Phone2,
    Remarks,
    location,
  } = req.body;
  const user = await userService.getUserById(userId);

  if (user && UserType != 2) {
    return res.status(200).json({
      success: false,
      message: "Unauthorized!",
    });
  }

  const lead = await indiamartleads.findOne({
    _id: leadId,
    //  ASSIGNED: false
  });
  if (lead) {
    let leadData = {
      Remark: lead.QUERY_MESSAGE,
      parentId: lead.PARENT_ID,
      userId: userId,
      leadId,
      // Name: lead.SENDER_NAME,
      // EnquiryDate: lead.QUERY_TIME,
      // Phone1: lead.SENDER_MOBILE,
      // Phone2: lead.SENDER_MOBILE_ALT,
      // Email: lead.SENDER_EMAIL,
      // City: lead.SENDER_CITY,
      // Address: lead.SENDER_ADDRESS,
      // AssignTo: user.Name,

      assignId,
      courseId,
      branchId,
      statusId,
      sourceId,
      cityId,
      CoursePrice,
      Email,
      EnquiryDate,
      FollowupDate,
      Name,
      Phone1,
      Phone2,
      Remarks,
      location,
    };
    await leadService.addLead(leadData);
    // lead.ASSIGNED = true;
    await lead.save();
    await indiamartleads.findByIdAndDelete({ _id: leadId });
  } else {
    return res.status(400).send({
      success: false,
      message: "Lead does not exist",
    });
  }

  return res.status(200).json({
    success: true,
    message: "lead assigned successfully!!",
  });
});

module.exports = {
  addLead,
  updateLead,
  deleteLead,
  getLeadById,
  getCourse_Branch_UserData,
  addLeadLogs,
  getLeads,
  getDuplicateLeads,
  TodaysFollowupLeads,
  getLeadLogs,
  searchDuplicateLeads,
  getNewLeads,
  assignLeadToUser,
  getUserLeads,
  recieveIndiaMartLeads,
  recieveIndiaMartLead,
  getAllUserLeads,
  getUserLeadById,
  getAssignUserLeads,
};
