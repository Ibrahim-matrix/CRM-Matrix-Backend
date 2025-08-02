const Joi = require("joi");
const { objectId } = require("./custom.validation");
const registerAdmin = {
  body: Joi.object().keys({
    Email: Joi.string().required(),
    Name: Joi.string().required(),
    UserName: Joi.string().required(),
    Phone: Joi.string().required(),
    City: Joi.string().required(),
    companyName: Joi.string().required(),
    UserType: Joi.number().required(),
    menuPermissions: Joi.array().required(),
    Address: Joi.string().required(),
    teamSize: Joi.number().required(),
    numberOfUsers: Joi.number().required(),
    validupTo: Joi.string().required(),
    webURL: Joi.string().required(),
  }),
};
const loginAdmin = {
  body: Joi.object().keys({
    Email: Joi.string().required(),
    Password: Joi.string().required(),
    type: Joi.string().required(),
  }),
};

module.exports = { registerAdmin, loginAdmin };
