const { templates } = require("../models");
const addTemplate = async (templateData) => {
  
  return await templates.create(templateData);
};
const getTemplates = async () => {
  return await templates.find({});
};
const updateTemplate = async (templateId, templateData) => {
  return await templates.findOneAndUpdate({ _id: templateId }, templateData);
};
const deleteTemplate = async (templateId) => {
  return await templates.findOneAndDelete({ _id: templateId });
};
module.exports = {
  addTemplate,
  getTemplates,
  updateTemplate,
  deleteTemplate,
};
