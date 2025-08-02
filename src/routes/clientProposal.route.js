const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const clientPropsoalController = require("../controllers/clientProposal.controller");

router
  .route("/:id")
  .get(clientPropsoalController.getClientPropoal)
  .put(clientPropsoalController.updateAcceptAndSignClientProposal);

router.route("/").post(auth, clientPropsoalController.sendProposalToClient);
module.exports = router;
