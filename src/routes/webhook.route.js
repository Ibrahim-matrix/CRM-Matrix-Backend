const express = require("express");
const router = express.Router();

const webhookController = require("../controllers/webhook.controller");

router.post("/lead-data", webhookController.getLeadData);

module.exports = router;
