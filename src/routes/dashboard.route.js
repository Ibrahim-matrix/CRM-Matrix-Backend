const express = require('express');

const dashboardController = require('../controllers/dashboard.controller')
const auth = require("../middlewares/auth");

const router = express.Router()

router.route("/leads-count").get(auth,dashboardController.getLeadsCount);

router.route("/leads").get(auth,dashboardController.getLeadsDetail);
router.route("/analytics").get(auth,dashboardController.getAnalyticsDetail);
router.route("/calls").get(auth,dashboardController.getCallDetails);

router.route("/source").get(auth,dashboardController.getSourceDetails);



module.exports = router;