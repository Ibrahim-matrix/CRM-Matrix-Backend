const httpStatus = require("http-status");
const { GreetingCategory } = require("../models");
const catchAsync = require("../utils/catchAsync");

const addGreetingCategory = catchAsync(async (req, res) => {
  const user = req.user;
  if (user.UserType == 2) {
    req.body["parentId"] = user.userId;
  }
  if (user.UserType == 3) {
    req.body["parentId"] = user.parentId;
  }

  const category = await GreetingCategory.create(req.body);

  return res.status(httpStatus.OK).json({
    message: "caterory added.",
    Data: category,
  });
});

const getGreetingCategories = catchAsync(async (req, res) => {
  const user = req.user;
  let filter = {};
  if (user.UserType == 2) {
    filter["parentId"] = user.userId;
  } else if (
    req.user.UserType == 3 &&
    (user.UserProfile === "Manager" || user.UserProfile === "Custom")
  ) {
    if (Array.isArray(user.Permission) && user.Permission.length > 0) {
      const permittedUserId = user.Permission.map((p) => p.userId);
      permittedUserId.push(user.userId);
      permittedUserId.push(user.parentId);
      filter = {
        parentId: user.parentId,
        createdBY: {
          $in: permittedUserId,
        },
      };
    }
  } else if (user.UserType === 3 && user.UserProfile === "User") {
    const ids = [user.userId, user.parentId];
    filter = {
      parentId: user.parentId,
      createdBY: { $in: ids },
    };
  }

  const categories = await GreetingCategory.find(filter);

  res.status(httpStatus.OK).json({
    message: "got categories.",
    Data: categories,
  });
});

module.exports = {
  addGreetingCategory,
  getGreetingCategories,
};
