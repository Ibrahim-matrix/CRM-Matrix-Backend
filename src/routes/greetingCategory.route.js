const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const categoryController = require("../controllers/greetingCategory.controller");

router
  .route("/")
  .post(auth, categoryController.addGreetingCategory)
  .get(auth, categoryController.getGreetingCategories);

module.exports = router;
