const express = require("express");
const router = express.Router();


const atController = require("../controllers/at.controller");

router.post(
  "/at-data",
  atController.getAtData
);

module.exports = router;
