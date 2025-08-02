const mongoose = require("mongoose");
const statusModel = require("../models/status.model");
const httpStatus = require("http-status");
const { statusService } = require("../services");
const catchAsync = require("../utils/catchAsync");
const addStatus = catchAsync(async (req, res) => {
  const { StatusName, icon, color } = req.body;
  if (
    StatusName === "Open" ||
    StatusName === "Final" ||
    StatusName === "Purchased"
  ) {
    return res.status(400).send({
      message: `${StatusName} is the mandatroy status. You cannot create this`,
    });
  }

  if (req.user.UserType == 2) {
    req.body["parentId"] = req.user.userId;
  }
  if (req.user.UserType == 3) {
    (req.body["parentId"] = req.user.parentId),
      (req.body["userId"] = req.user.userId);
  }
  const status = await statusService.addStatus(req.body);

  return res.status(httpStatus.CREATED).json({
    message: "Status added successfully!!",
    Data: status,
  });
});
const updateStatus = catchAsync(async (req, res) => {
  const status = await statusService.updateStatus(req.params.id, req.body);

  return res.status(httpStatus.OK).json({
    message: "status updated succssfully!!",
    Data: status,
  });
});
const deleteStatus = catchAsync(async (req, res) => {
  const status = await statusService.deleteStatus(req.params.id);

  return res.status(httpStatus.OK).json({
    message: "status deleted succssfully!!",
    Data: status,
  });
});
const getStatus = catchAsync(async (req, res) => {
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
  const status = await statusService.getStatus(filter);

  return res.status(httpStatus.OK).json({
    message: "status",
    Data: status,
  });
});
const getStatusById = catchAsync(async (req, res) => {
  try {
    const status = await statusModel.findById(req.params.id);
    if (status) {
      res.json(status);
    } else {
      res.status(404).json({ message: "Status not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = {
  addStatus,
  updateStatus,
  deleteStatus,
  getStatus,
  getStatusById,
};
