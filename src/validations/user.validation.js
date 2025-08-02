const Joi = require("joi");
const { objectId } = require("./custom.validation");

const addUser = {
  body: Joi.object().keys({
    Email: Joi.string().email().required(),
    Name: Joi.string().required(),
    City: Joi.string().required(),
    UserName: Joi.string().required(),
    UserType: Joi.number().required(),
    Phone: Joi.string().required(),
    Branch: Joi.string().required(),
    menuPermissions: Joi.array().required(),
    UserProfile: Joi.string().required(),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    Email: Joi.string().email().required(),
    Name: Joi.string().required(),
    City: Joi.string().required(),
    UserName: Joi.string().required(),
    UserType: Joi.number().required(),
    Phone: Joi.string().required(),
    Branch: Joi.string().required(),
    menuPermissions: Joi.array().required(),
    UserProfile: Joi.string().required(),
  }),
};

const deleteUser = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

module.exports = { addUser, updateUser, deleteUser };
