const express = require("express");

const cityController = require("../controllers/city.controller");
const validate = require("../middlewares/validate");
const branchValidation = require("../validations/city.validation");
const auth = require("../middlewares/auth");

const router = express.Router();

router
  .route("/")
  .get(auth, cityController.getCity)
  .post(auth, validate(branchValidation.addCity), cityController.addCity);

router
  .route("/:id")
  .get(auth, cityController.getCityById)
  .put(auth,
    //  validate(branchValidation.updateCity),
   cityController.updateCity
   )
  .delete(
    auth,
    validate(branchValidation.deleteCity),
    cityController.deleteCity
  );

module.exports = router;
