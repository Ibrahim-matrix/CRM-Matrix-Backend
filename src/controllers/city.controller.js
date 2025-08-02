const mongoose = require("mongoose");
const cityModel = require("../models/city.model");
const httpStatus = require("http-status");
const { cityService } = require("../services");
const catchAsync = require("../utils/catchAsync");

const addCity = catchAsync(async (req, res) => {
  const { branchId } = req.body;

  if (!branchId) {
    return res.status(400).json({
      message: "Branch Id is required",
    });
  }
  if (req.user.UserType == 2) {
    req.body["parentId"] = req.user.userId;
  }
  if (req.user.UserType == 3) {
    (req.body["parentId"] = req.user.parentId),
      (req.body["userId"] = req.user.userId);
  }
  const city = await cityService.addCity(req.body);

  return res.status(httpStatus.CREATED).json({
    message: "City added successfully!!",
    Data: city,
  });
});

const updateCity = catchAsync(async (req, res) => {
  const city = await cityService.updateCity(req.params.id, req.body);

  return res.status(httpStatus.OK).json({
    message: "city updated succssfully!!",
    Data: city,
  });
});

const deleteCity = catchAsync(async (req, res) => {
  const city = await cityService.deleteCity(req.params.id);

  return res.status(httpStatus.OK).json({
    message: "city deleted succssfully!!",
    Data: city,
  });
});

const getCity = catchAsync(async (req, res) => {
  const { branchId } = req.query;
  // if (!branchId) {
  //   return res.status(400).json({
  //     message: "Branch Id is required",
  //   });
  // }
  let filter = {
    // branchId,
  };
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
  const city = await cityService.getCity(filter);

  return res.status(httpStatus.OK).json({
    message: "city",
    Data: city,
  });
});

const getCityById = catchAsync(async (req, res) => {
  try {
    const city = await cityModel.findById(req.params.id);
    // .populate({
    //   path: "branchId",
    //   model: "branch",
    //   populate: {
    //     path: "userId",
    //     model: "user",
    //   },
    // });
    if (city) {
      res.json(city);
    } else {
      res.status(404).json({ message: "City not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = {
  addCity,
  updateCity,
  deleteCity,
  getCity,
  getCityById,
};
