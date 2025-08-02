const express = require("express");

const sourceController = require("../controllers/source.controller");
const auth = require("../middlewares/auth");

const router = express.Router();

router
  .route("/")
  .get(auth, sourceController.getSource)
  .post(auth,sourceController.addSource);

router
  .route("/:id")
  .get(auth, sourceController.getSourceById)
  .put(auth, sourceController.updateSource)
  .delete(auth,sourceController.deleteSource);

module.exports = router;
