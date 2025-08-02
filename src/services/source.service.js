const { source } = require("../models");
const addSource = async (bodyData) => {
  return await source.create(bodyData);
};
const updateSource = async (sourceId, updateData) => {
  return await source.findOneAndUpdate(
    {
      _id: sourceId,
    },
    updateData,
    { new: true }
  );
};
const deleteSource = async (sourceId) => {
  return await source.findOneAndDelete({
    _id: sourceId,
  });
};
const getSource = async (filter) => {
  return await source.find(filter);
};

module.exports = {
  addSource,
  updateSource,
  deleteSource,
  getSource,
};
