const Joi = require("joi");
const { objectId } = require("./custom.validation");

const addSource = {
  body: Joi.object().keys({
    sourceName: Joi.string().required(),
    description: Joi.string().required(),
  }),
};

const updateSource = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    sourceName: Joi.string().required(),
    description: Joi.string().required(),
  }),
};

const deleteSource = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

module.exports = { addSource, updateSource, deleteSource };
