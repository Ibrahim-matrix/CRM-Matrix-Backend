const express = require("express");
const {
  upload,
  uploadFiles,
} = require("../controllers/uploadFiles.controller");
const router = express.Router();

router.route("/").post(upload.single("file"), uploadFiles);

module.exports = router;
