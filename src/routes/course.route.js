const express = require("express");

const courseController = require("../controllers/course.controller");
const validate = require("../middlewares/validate");
const courseValidation = require("../validations/course.validation");
const auth = require("../middlewares/auth");

const { cacheMiddleware } = require("../middlewares/cache");

const router = express.Router();

router
  .route("/")
  .get(auth, courseController.getCourse)
  .post(auth, validate(courseValidation.addCourse), courseController.addCourse);

router
  .route("/:id")
  .get(auth, courseController.getCourseById)
  .put(
    auth,
    // validate(courseValidation.updateCourse),
    courseController.updateCourse
  )
  .delete(
    auth,
    validate(courseValidation.deleteCourse),
    courseController.deleteCourse
  );

module.exports = router;
