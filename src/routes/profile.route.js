const express = require("express");

const profileController = require("../controllers/profile.controller");
const auth = require("../middlewares/auth");
const { updatePassword } = require("../controllers/auth.controller");

const router = express.Router();

router.route("/").get(auth, profileController.getOwnProfile);
router.route("/edit").put(auth, profileController.updateProfile);

module.exports = router;
