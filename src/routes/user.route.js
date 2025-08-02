const express = require("express");

const validate = require("../middlewares/validate");
const { profileImage } = require("../middlewares/upload");

const userController = require("../controllers/user.controller");
const { userValidation } = require("../validations");
const router = express.Router();
const auth = require("../middlewares/auth");

router.route("/").get(auth, userController.getUsers).post(
  // profileImage.single("file"),
  //validate(userValidation.addUser),
  auth,
  userController.addUser
);

router.route("/addMenu")
  .put(auth, userController.updateMenuPermissions)

router
  .route("/crmKey")
  .put(auth, userController.addCrmKey)

router
  .route("/:id")
  .get(auth, userController.getUserById)
  .put(auth, userController.updateUser)
  .delete(auth, userController.deleteUser);

module.exports = router;
