const express = require("express");
const auth = require("../middlewares/auth");
const proposalController = require("../controllers/proposal.controller");

const router = express.Router();

router
  .route("/")
  .post(auth, proposalController.addProposal)
  .get(auth, proposalController.getProposals);

router
  .route("/:id")
  .get(auth, proposalController.getProposalById)
  .put(auth, proposalController.updateProposal);
module.exports = router;
