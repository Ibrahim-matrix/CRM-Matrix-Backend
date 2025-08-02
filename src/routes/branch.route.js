const express = require("express");
const router = express.Router();
const branchController = require("../controllers/branch.controller");
const validate = require("../middlewares/validate");
const branchValidation = require("../validations/branch.validation");
const auth = require("../middlewares/auth");

router.get("/", auth, branchController.getBranch);
router.post(
  "/",
  auth,
  // validate(branchValidation.addBranch),
  branchController.addBranch
);

router.get(
  "/:id",
  auth,
  // validate(branchValidation.addBranch),
  branchController.getBranchById
);
router.put(
  "/:id",
  auth,
  // validate(branchValidation.updateBranch),
  branchController.updateBranch
);
router.delete(
  "/:id",
  auth,
  // validate(branchValidation.deleteBranch),
  branchController.deleteBranch
);

module.exports = router;
