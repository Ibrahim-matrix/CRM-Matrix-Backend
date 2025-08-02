const Joi = require("joi");
const { objectId } = require("./custom.validation");


const addIssue = {
  body: Joi.object().keys({
    pageName: Joi.string().required(),
    issueName: Joi.string().required(),
  }),
};


// const updateCIssue = {
//   params: Joi.object().keys({
//     id: Joi.string().custom(objectId).required(),
//   }),
//   body: Joi.object().keys({
//     cityName:Joi.string().required(),
//   }),
// };

// const deleteIssue = {
//   params: Joi.object().keys({
//     id: Joi.string().custom(objectId),
//   }),
// };

module.exports = { addIssue, };
