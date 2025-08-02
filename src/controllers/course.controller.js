const mongoose = require("mongoose");
const courseModel = require("../models/course.model");
const httpStatus = require("http-status");
const { courseService } = require("../services");
const { setCache, deleteCache } = require("../utils/cacheSetterDeleter");
const catchAsync = require("../utils/catchAsync");
const addCourse = catchAsync(async (req, res) => {
  const redisClient = req.app.get("redisClient");
  if (req.user.UserType == 2) {
    req.body["parentId"] = req.user.userId;
  }
  if (req.user.UserType == 3) {
    (req.body["parentId"] = req.user.parentId),
      (req.body["userId"] = req.user.userId);
  }
  const course = await courseService.addCourse(req.body);
  await deleteCache(redisClient, req.originalUrl);
  return res.status(httpStatus.CREATED).json({
    message: "Product added successfully!!",
    Data: course,
  });
});
const updateCourse = catchAsync(async (req, res) => {
  const redisClient = req.app.get("redisClient");
  const course = await courseService.updateCourse(req.params.id, req.body);
  await deleteCache(redisClient, req.originalUrl);
  return res.status(httpStatus.OK).json({
    message: "Product updated succssfully!!",
    Data: course,
  });
});
const deleteCourse = catchAsync(async (req, res) => {
  const redisClient = req.app.get("redisClient");

  const course = await courseService.deleteCourse(req.params.id);
  await deleteCache(redisClient, req.originalUrl);

  return res.status(httpStatus.OK).json({
    message: "Product deleted succssfully!!",
    Data: course,
  });
});
const getCourse = catchAsync(async (req, res) => {
  const redisClient = req.app.get("redisClient");

  // console.log('hi------------');
  

  let filter = {};
  if (req.user.UserType == 1) {
    Object.assign(filter, {
      parentId: req.query.parentId,
    });
  }
  if (req.user.UserType === 2) {
    filter["parentId"] = req.user.userId;
  }
  if (req.user.UserType === 3) {
    // filter["userId"] = req.user.userId;
    filter["parentId"] = req.user.parentId;
  }

  if (req.query._id) {
    filter["_id"] = req.query._id;
  }

  const course = await courseService.getCourse(filter);

  //await setCache(redisClient,req.originalUrl, JSON.stringify(course));

  return res.status(httpStatus.OK).json({
    message: "Product",
    Data: course,
  });
});
const getCourseById = catchAsync(async (req, res) => {
  try {
    const course = await courseModel.findById(req.params.id);
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = {
  addCourse,
  updateCourse,
  deleteCourse,
  getCourse,
  getCourseById,
};
