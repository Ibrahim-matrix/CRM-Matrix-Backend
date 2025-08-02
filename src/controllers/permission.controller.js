const { permissionService } = require("../services");
const catchAsync = require("../utils/catchAsync");

const addPermission = catchAsync(async (req, res) => {
  const addPermission = await permissionService.addPermission(req.body);
  return res.status(201).json({
    message: "permission created successfully!!",
  });
});
const getPermission = catchAsync(async (req, res) => {
  const permissions = await permissionService.getPermission();
  return res.status(200).json({
    Data: permissions,
  });
});
module.exports = {
  addPermission,
  getPermission,
};
