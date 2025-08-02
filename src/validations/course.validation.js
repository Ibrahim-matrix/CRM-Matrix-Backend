const Joi = require("joi");
const { objectId } = require("./custom.validation");

const addCourse = {
  body: Joi.object().keys({
    CourseName: Joi.string().required(),
    CourseValue: Joi.string().required(),
  }),
};

const updateCourse = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    courseName: Joi.string().required(),
    coursePrice: Joi.string().required(),
  }),
};

const deleteCourse = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

module.exports = { addCourse, updateCourse, deleteCourse };
