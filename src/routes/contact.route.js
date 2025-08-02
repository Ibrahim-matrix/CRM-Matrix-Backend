const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");

const contactController = require("../controllers/contact.controller");
const validate = require("../middlewares/validate");

router.post(
  "/",
  //    profileImage.single('file'),
  contactController.addContact
);
router.get("/", contactController.getContacts);

module.exports = router;
