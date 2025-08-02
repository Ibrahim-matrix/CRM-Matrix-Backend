const Joi = require("joi");
const { objectId } = require("./custom.validation");

const object = Joi.object({
  a: Joi.number().min(1).max(10).integer(),
  b: 'some string'
});
const addLead = {
  body: Joi.object().keys({
    Name:Joi.string().required(),
    EnquiryCourse:Joi.string().required(),
    CoursePrice:Joi.number().required(),
    Phone1:Joi.string().required(),
    Phone2:Joi.string().required(),
    Email:Joi.string().required(),
    FollowupDate:Joi.string().required(),
    EnquiryDate:Joi.string().required(),
    Status:Joi.string().required(),
    Branch:Joi.string().required(),
    City:Joi.string().required(),
    Source:Joi.string().required(),
    AssignTo:Joi.string().required(),
    location:Joi.string().required(),
    Remarks:Joi.string().required(),
  }),
};

const updateLead = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    owner: Joi.string(),
    name: Joi.string(),
    enquiryDate: Joi.date(),
    enquiryCourse: Joi.string(),
    mobileNumber: Joi.string(),
    mobileNumber2: Joi.string(),
    email: Joi.string(),
    followUp: Joi.date(),
    status: Joi.string(),
    branch: Joi.string(),
    city: Joi.string(),
    source: Joi.string(),
    assignedTo: Joi.string(),
    location: Joi.string(),
    image: Joi.string(),
    remarks: Joi.string(),
    lfd: Joi.string(),
    days: Joi.string(),
  }),
};

const deleteLead = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

module.exports = { addLead, updateLead, deleteLead };
