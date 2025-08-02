const express = require("express");
const permissionController = require("../controllers/permission.controller");
const router = express.Router();
router.route("/").post(permissionController.addPermission).get(permissionController.getPermission);

module.exports = router;
