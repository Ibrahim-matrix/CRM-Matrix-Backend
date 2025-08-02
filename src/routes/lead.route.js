const express = require("express");

const validate = require("../middlewares/validate");
const auth = require("../middlewares/auth");
const { profileImage } = require("../middlewares/upload");
const { leadValidation } = require("../validations");

const leadController = require("../controllers/lead.controller");


const router = express.Router();


router.get("/getAllUserLeads/:id",auth, leadController.getAllUserLeads)
router.get("/getUserLead/:id",auth, leadController.getUserLeadById)

router
  .route("/recieve-indiamart-leads")
  .get(leadController.recieveIndiaMartLeads);

router
.route("/recieve-indiamart-lead/:id")
.get(leadController.recieveIndiaMartLead);

router.route("/duplicate-lead").get(leadController.getDuplicateLeads);
router
  .route("/search-duplicate-lead")
  .get(auth, leadController.searchDuplicateLeads);

router.route("/").get(auth, leadController.getNewLeads).post(
  //profileImage.single("file"),
  auth,
  // validate(leadValidation.addLead),
  leadController.addLead
);
router.route("/new-leads").get(auth, leadController.getNewLeads);

router
  .route("/logs")
  .post(auth, leadController.addLeadLogs)
  .get(auth, leadController.getLeadLogs);

router
  .route("/course-branch-user")
  .get(auth, leadController.getCourse_Branch_UserData);

router.route("/follow-up-leads").get(auth, leadController.TodaysFollowupLeads);

router
  .route("/:id")
  .get( auth,leadController.getLeadById)
  .put(auth, leadController.updateLead)
  .delete(auth, leadController.deleteLead);

router
.route("/userLeads/:id")
.get(auth, leadController.getUserLeads)

router
.route("/assignUserLead/:id")
.get(auth, leadController.getAssignUserLeads)


router.route("/assign-to-user").post(auth,leadController.assignLeadToUser)

module.exports = router;
