const express = require("express");

const issueController = require("../controllers/issue.controller");
const { upload } = require("../middlewares/uploadImage");
const validate = require("../middlewares/validate");
const issueValidation = require("../validations/issue.validation");
const auth = require("../middlewares/auth");
const router = express.Router();

router.route("/userIssues").get(auth, issueController.getIssues);

router
  .route("/")
  .get(auth, issueController.getUserIssues)
  .post(auth, issueController.addIssue);

router
  .route("/:id")
  .get(auth, issueController.getIssue)
  .put(auth, issueController.updateIssue);

module.exports = router;
