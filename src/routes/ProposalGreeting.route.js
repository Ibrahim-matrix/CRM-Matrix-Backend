const express = require("express");
const auth = require("../middlewares/auth");
const proposalGreetingController = require("../controllers/proposalGreeting.controller");

const router = express.Router();

router
  .route("/")
  .post(auth, proposalGreetingController.addProposalGreeting)
  .get(auth, proposalGreetingController.getProposalGreetings);

router
  .route("/:id")
  .get(auth, proposalGreetingController.getProposalGreetingById)
  .put(auth, proposalGreetingController.updateProposalGreeting)
  .delete(auth, proposalGreetingController.deleteProposalGreeting);

module.exports = router;
