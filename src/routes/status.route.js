const express = require("express");

const statusController = require("../controllers/status.controller");
const auth = require("../middlewares/auth");

const router = express.Router();

router
  .route("/")
  .get(auth, statusController.getStatus)
  .post(auth,statusController.addStatus);

router
  .route("/:id")
  .get(auth, statusController.getStatusById)
  .put(auth, statusController.updateStatus)
  .delete(auth,statusController.deleteStatus);

module.exports = router;
