const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const {
  upload,
  uploadImage,
  uploadFile,
  uploadFileMulter,
} = require("../controllers/upload.controller");

router.route("/").post(auth, upload.single("file"), uploadImage);

router.route("/file").post(auth, uploadFileMulter.single("file"), uploadFile);

module.exports = router;
