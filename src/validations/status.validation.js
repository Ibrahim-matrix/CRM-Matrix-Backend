const Joi = require("joi");
const { objectId } = require("./custom.validation");
const addStatus = {
  body: Joi.object().keys({
    status: Joi.string().required(),
  }),
};
const updateStatus = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().required(),
  }),
};

const deleteStatus = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

module.exports = { addStatus, updateStatus, deleteStatus };
