const mongoose = require("mongoose");
const sourceModel = require("../models/source.model");
const httpStatus = require("http-status");
const { sourceService } = require("../services");
const catchAsync = require("../utils/catchAsync");
const addSource = catchAsync(async (req, res) => {
  if (req.user.UserType == 2) {
    req.body["parentId"] = req.user.userId;
  }
  if (req.user.UserType == 3) {
    (req.body["parentId"] = req.user.parentId),
      (req.body["userId"] = req.user.userId);
  }
  const addSource = await sourceService.addSource(req.body);
  return res.status(httpStatus.CREATED).json({
    message: "Source created successfully!!",
    Data: addSource,
  });
});
const updateSource = catchAsync(async (req, res) => {
  const updateSource = await sourceService.updateSource(
    req.params.id,
    req.body
  );
  return res.status(httpStatus.CREATED).json({
    message: "Source updated successfully!!",
    Data: updateSource,
  });
});
const deleteSource = catchAsync(async (req, res) => {
  const deleteSource = await sourceService.deleteSource(req.params.id);
  return res.status(httpStatus.CREATED).json({
    message: "Source deleted successfully!!",
    Data: deleteSource,
  });
});
const getSource = catchAsync(async (req, res) => {
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

  const source = await sourceService.getSource(filter);
  return res.status(httpStatus.OK).json({
    message: "success!!",
    Data: source,
  });
});
const getSourceById = catchAsync(async (req, res) => {
  try {
    const source = await sourceModel.findById(req.params.id);
    if (source) {
      res.json(source);
    } else {
      res.status(404).json({ message: "Source not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = {
  addSource,
  updateSource,
  deleteSource,
  getSource,
  getSourceById,
};
