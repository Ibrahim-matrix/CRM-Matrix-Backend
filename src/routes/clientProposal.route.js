const express = require("express");
const router = express.Router();
const clientPropsoalController = require("../controllers/clientProposal.controller");

router
  .route("/:id")
  .get(clientPropsoalController.getClientPropoal)
  .put(clientPropsoalController.updateAcceptAndSignClientProposal);

module.exports = router;
