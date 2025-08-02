const httpStatus = require("http-status");
// const { users } = require("../models");
const bcrypt = require("bcrypt");
const {
  userService,
  leadService,
  sourceService,
  cityService,
  courseService,
  statusService,
  branchService,
} = require("../../services");
const pick = require("../../utils/pick");
const { ObjectId } = require("mongodb");
const SideMenu = require("../../models/sideMenu");
const catchAsync = require("../../utils/catchAsync");
const { users, leads, Todo } = require("../../models");
const course = require("../../models/course.model");

const createTodo = catchAsync(async (req, res) => {
  const { note } = req.body;
  const createdBy = req.user.userId;

  const todo = new Todo({
    note,
    createdBy,
  });

  const savedTodo = await todo.save();

  res.status(httpStatus.CREATED).json({
    message: "Todo created successfully",
    Data: savedTodo,
  });
});

const getTodos = catchAsync(async (req, res) => {
  const createdBy = req.user._id;

  const todos = await Todo.find();

  res.status(httpStatus.OK).json({
    message: "Todos fetched successfully",
    Data: todos,
  });
});

const getTodoById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const todo = await Todo.findById(id);

  if (!todo) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: "Todo not found",
    });
  }

  res.status(httpStatus.OK).json({
    message: "Todo fetched successfully",
    Data: todo,
  });
});

const updateTodo = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { note, status } = req.body;

  const todo = await Todo.findById(id);

  if (!todo) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: "Todo not found",
    });
  }

  todo.note = note || todo.note;
  todo.status = status || todo.status;

  const updatedTodo = await todo.save();

  res.status(httpStatus.OK).json({
    message: "Todo updated successfully",
    Data: updatedTodo,
  });
});

const deleteTodo = catchAsync(async (req, res) => {
  const { id } = req.params;

  const todo = await Todo.findById(id);

  if (!todo) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: "Todo not found",
    });
  }

  await todo.deleteOne();

  res.status(httpStatus.OK).json({
    message: "Todo deleted successfully",
  });
});

const updateSuperAdmin = catchAsync(async (req, res) => {
  console.log(req.body);
  const updateUser = await users.findOneAndUpdate(
    {
      _id: req.user.userId,
    },
    req.body,
    { new: true }
  );
  return res.status(httpStatus.CREATED).json({
    message: "Profile updated successfully!!",
    Data: updateUser,
  });
});

const updateSuperAdminPassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const { userId } = req.user;
  let { type } = req.body;

  const user = await userService.getUserById(userId);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  if (newPassword != confirmPassword) {
    return res.status(404).json({
      success: false,
      message: "New password and confirm password does not matched!",
    });
  }

  const decPassord = await bcrypt.compare(currentPassword, user.Password);
  if (!decPassord) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Current password does not matched!",
    });
  }

  // Remove the app type from user's app types
  const index = user.appTypes.indexOf(type);
  if (index !== -1) {
    user.appTypes.splice(index, 1);
  }

  // Remove the corresponding jti from the appropriate array
  if (type === "app") {
    const jtiIndex = user.appJtis.indexOf(req.user.jti);
    if (jtiIndex !== -1) {
      user.appJtis.splice(jtiIndex, 1);
    }
  } else if (type === "web") {
    const jtiIndex = user.webJtis.indexOf(req.user.jti);
    if (jtiIndex !== -1) {
      user.webJtis.splice(jtiIndex, 1);
    }
  }
  user["Password"] = newPassword;
  await user.save();

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Password succssfully updated!",
  });
});

const updateAdmin = catchAsync(async (req, res) => {
  const updateUser = await userService.updateUser(req.params.id, req.body);
  s;
  return res.status(httpStatus.CREATED).json({
    message: "Admin updated successfully!!",
    Data: updateUser,
  });
});

const getAllAdmins = async (req, res) => {
  if (req.user.UserType != 1) {
    return res.status(401).send({
      success: false,
      message: "Unauthorized",
    });
  }
  const { id } = req.query;
  let filter = {
    UserType: 2,
  };
  if (id) {
    filter["_id"] = new ObjectId(id);
  }
  const admins = await userService.getAllAdminsNew(filter);
  return res.status(httpStatus.OK).json({
    Data: admins,
  });
};

const getAllLeads = catchAsync(async (req, res) => {
  const {
    keyword,
    // City,
    // Course,
    // Status,
    // Branch,
    // AssignTo,
    // Source,
    parentId,
    cityId,
    courseId,
    statusId,
    branchId,
    assignId,
    sourceId,
    EnquiryDate,
    FollowupDate,
  } = req.query;
  let filter = {};
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  Object.assign(filter, {
    parentId: new ObjectId(parentId),
  });
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
  if (EnquiryDate) {
    const isoDateString1 = EnquiryDate.gte;
    const isoDateString2 = EnquiryDate.lte;

    const date1 = new Date(isoDateString1);
    const date2 = new Date(isoDateString2);
    Object.assign(filter, {
      EnquiryDate: {
        $gte: new Date(date1),
        $lt: new Date(date2),
      },
    });
  }
  if (FollowupDate) {
    const isoDateString1 = FollowupDate.gte;
    const isoDateString2 = FollowupDate.lte;

    const date1 = new Date(isoDateString1);
    const date2 = new Date(isoDateString2);
    Object.assign(filter, {
      FollowupDate: {
        $gte: new Date(date1),
        $lt: new Date(date2),
      },
    });
  }
  const leadss = await leadService.getNewLeads(filter, options);
  const { docs, ...otherFields } = leadss;
  return res.status(httpStatus.OK).json({
    message: "success!!",
    Data: docs,
    ...otherFields,
  });
});

const getDashboardCounts = catchAsync(async (req, res) => {
  try {
    const allAdminsCount = await users.countDocuments({ UserType: 2 });
    const activeAdminsCount = await users.countDocuments({
      UserType: 2,
      active: true,
    });

    const totalRevenue = await leads.aggregate([
      {
        $lookup: {
          from: "status",
          localField: "statusId",
          foreignField: "_id",
          as: "statusInfo",
        },
      },
      {
        $match: {
          $or: [
            { "statusInfo.StatusName": "Final" },
            { "statusInfo.StatusName": "Purchased" },
          ],
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ["$CoursePrice", 0] } },
        },
      },
    ]);

    const data = {
      allAdminsCount,
      activeAdminsCount,
      inactiveAdminsCount: allAdminsCount - activeAdminsCount,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
    };

    return res.status(httpStatus.OK).json({
      message: "success!!",
      Data: data,
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

const getAdminsTotalCoursePrice = catchAsync(async (req, res) => {
  try {
    // Step 1: Find users with UserType: 2
    const eligibleUsers = await users.find({ UserType: 2 });

    // Step 2: Extract the _id values from eligible users
    const eligibleUserIds = eligibleUsers.map((user) => user._id);

    // Step 3: Build the aggregation pipeline using $match to filter by eligible users
    const pipeline = [
      {
        $match: {
          parentId: { $in: eligibleUserIds },
        },
      },
      {
        $lookup: {
          from: "status",
          localField: "statusId",
          foreignField: "_id",
          as: "statusInfo",
        },
      },
      {
        $match: {
          $or: [
            // { "statusInfo.StatusName": "Pre-Headed" },
            { "statusInfo.StatusName": "Final" },
          ],
        },
      },
      {
        $group: {
          _id: "$parentId",
          totalCoursePrice: { $sum: { $ifNull: ["$CoursePrice", 0] } },
        },
      },
    ];

    // Step 4: Execute the aggregation pipeline
    const results = await leads.aggregate(pipeline);

    // Step 5: Process results and create the response
    const data = await Promise.all(
      eligibleUsers.map((user) => {
        const result = results.find(
          (r) => r._id.toString() === user._id.toString()
        );
        const adminName = user ? user.Name : "Unknown";
        const totalCoursePrice = result ? result.totalCoursePrice : 0;

        return {
          [adminName]: totalCoursePrice,
        };
      })
    );

    return res.status(httpStatus.OK).json({
      message: "success!!",
      Data: data,
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

const updateRaisedIssues = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Ticket id is required",
    });
  }
  if (!remarks) {
    return res.status(400).json({
      success: false,
      message: "Remarks is required",
    });
  }
  const issue = await issueService.updateIssue(id, req.body);
  return res.status(200).json({
    success: true,
    message: "Issue updated succssfully!!",
    Data: issue,
  });
});

const getAdminProductRevenue = catchAsync(async (req, res) => {
  try {
    const { adminId } = req.params;

    // Step 1: Fetch courses based on adminId (userId)
    const courses = await course.find({ parentId: adminId });

    // Step 2: Iterate over each course and calculate revenue
    const data = await Promise.all(
      courses.map(async (courseItem) => {
        // Find leads associated with the current course
        const leadsForCourse = await leads.find({ courseId: courseItem._id });

        // Calculate total revenue for the current course
        const totalRevenue = leadsForCourse.reduce(
          (sum, lead) => sum + (lead.CoursePrice || 0),
          0
        );

        return {
          name: courseItem.CourseName,
          revenue: totalRevenue,
        };
      })
    );

    return res.status(httpStatus.OK).json({
      message: "success!!",
      Data: data,
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

const getAllSources = async (req, res) => {
  try {
    const { parentId } = req.query;
    if (req.user.UserType != 1) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized",
      });
    }
    if (!parentId) {
      return res.status(400).send({
        success: false,
        message: "Parent Id is required",
      });
    }
    let filter = {};
    Object.assign(filter, {
      parentId: new ObjectId(parentId),
    });

    const source = await sourceService.getSource(filter);
    return res.status(200).json({
      success: true,
      Data: source,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

const getAllCities = async (req, res) => {
  try {
    const { parentId } = req.query;
    if (req.user.UserType != 1) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized",
      });
    }
    if (!parentId) {
      return res.status(400).send({
        success: false,
        message: "Parent Id is required",
      });
    }
    let filter = {};
    Object.assign(filter, {
      parentId: new ObjectId(parentId),
    });

    const city = await cityService.getCity(filter);

    return res.status(httpStatus.OK).json({
      success: true,
      Data: city,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

const getAllCourses = async (req, res) => {
  console.log('hi----------------------');
  
  try {
    const { parentId } = req.query;
    if (req.user.UserType != 1) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized",
      });
    }
    if (!parentId) {
      return res.status(400).send({
        success: false,
        message: "Parent Id is required",
      });
    }
    let filter = {};
    Object.assign(filter, {
      parentId: new ObjectId(parentId),
    });

    const course = await courseService.getCourse(filter);

    return res.status(httpStatus.OK).json({
      success: true,
      Data: course,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

const getAllStatus = async (req, res) => {
  try {
    const { parentId } = req.query;
    if (req.user.UserType != 1) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized",
      });
    }
    if (!parentId) {
      return res.status(400).send({
        success: false,
        message: "Parent Id is required",
      });
    }
    let filter = {};
    Object.assign(filter, {
      parentId: new ObjectId(parentId),
    });

    const status = await statusService.getStatus(filter);

    return res.status(httpStatus.OK).json({
      success: true,
      Data: status,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

const getAllBranches = async (req, res) => {
  try {
    const { parentId } = req.query;
    if (req.user.UserType != 1) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized",
      });
    }
    if (!parentId) {
      return res.status(400).send({
        success: false,
        message: "Parent Id is required",
      });
    }
    let filter = {};
    Object.assign(filter, {
      parentId: new ObjectId(parentId),
    });

    const branch = await branchService.getBranch(filter);

    return res.status(httpStatus.OK).json({
      success: true,
      Data: branch,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

const getAllAssignTo = async (req, res) => {
  try {
    const { parentId } = req.query;
    if (req.user.UserType != 1) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized",
      });
    }
    if (!parentId) {
      return res.status(400).send({
        success: false,
        message: "Parent Id is required",
      });
    }
    let filter = {};
    Object.assign(filter, {
      parentId: new ObjectId(parentId),
    });

    const assignUsers = await userService.getUsers(filter);

    return res.status(httpStatus.OK).json({
      success: true,
      Data: assignUsers,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

const getAdminUsers = async (req, res) => {
  try {
    const parentId = req.params.id;
    if (req.user.UserType != 1) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized",
      });
    }
    if (!parentId) {
      return res.status(400).send({
        success: false,
        message: "Parent Id is required",
      });
    }
    let filter = {};
    Object.assign(filter, {
      parentId: new ObjectId(parentId),
    });

    const adminData = await users.findOne({ _id: parentId });
    const adminUsers = await userService.getUsers(filter);

    return res.status(httpStatus.OK).json({
      success: true,
      Data: { adminData, adminUsers },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

const addMenu = catchAsync(async (req, res) => {
  if (req.user.UserType !== 1) {
    return res.status(401).send({
      success: false,
      message: "Unauthorized Access",
    });
  }
  const { myMenu } = req.body;

  let exist = await SideMenu.findOne({});
  console.log("seid", exist);
  if (!exist) {
    exist = new SideMenu({ menu: [myMenu] });
  } else {
    exist.menu.push(myMenu);
  }
  console.log("seid", exist);
  await exist.save();

  return res.status(200).json({
    success: true,
    message: "Menu updated successfully!!",
    Data: exist,
  });
});

const getMenu = catchAsync(async (req, res) => {
  if (req.user.UserType !== 1) {
    return res.status(401).send({
      success: false,
      message: "Unauthorized Access",
    });
  }

  let sideMenu = await SideMenu.findOne({});
  if (!sideMenu) {
    return res
      .status(404)
      .json({ success: false, message: "Side menu not found" });
  }

  return res.status(200).json({
    success: true,
    Data: sideMenu,
  });
});

const deleteMenu = catchAsync(async (req, res) => {
  try {
    const { menuItem } = req.query;

    const sideMenu = await SideMenu.findOne();

    if (!sideMenu) {
      return res
        .status(404)
        .json({ success: false, message: "Side menu not found" });
    }

    const indexOfMenuItem = sideMenu.menu.indexOf(menuItem);

    if (indexOfMenuItem === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }

    sideMenu.menu.splice(indexOfMenuItem, 1);

    await sideMenu.save();

    return res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
      sideMenu,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: true, message: error.message });
  }
});

const updateMenu = catchAsync(async (req, res) => {
  try {
    const { oldMenuItem, newMenuItem } = req.body;

    const sideMenu = await SideMenu.findOne();

    if (!sideMenu) {
      return res
        .status(404)
        .json({ success: false, message: "Side menu not found" });
    }

    const indexOfOldMenuItem = sideMenu.menu.indexOf(oldMenuItem);

    if (indexOfOldMenuItem === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Old menu item not found" });
    }

    // Replace the old menu item with the new one
    sideMenu.menu[indexOfOldMenuItem] = newMenuItem;

    await sideMenu.save();

    return res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      sideMenu,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = {
  getAdminUsers,
  getAllAdmins,
  getAllLeads,
  getAllCities,
  getAllSources,
  getAllStatus,
  getAllCourses,
  getAllBranches,
  getAllAssignTo,
  addMenu,
  updateMenu,
  getMenu,
  deleteMenu,
  getDashboardCounts,
  getAdminsTotalCoursePrice,
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  updateSuperAdmin,
  updateSuperAdminPassword,
  getAdminProductRevenue,
  updateRaisedIssues,
  updateAdmin,
};
