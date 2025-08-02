const { status } = require("../models");
const addStatus = async (bodyData) => {
  return await status.create(bodyData);
};
const updateStatus = async (statusId, updateData) => {
  return await status.findOneAndUpdate(
    {
      _id: statusId,
    },
    updateData,
    { new: true }
  );
};
const deleteStatus = async (statusId) => {
  return await status.findOneAndDelete({
    _id: statusId,
  });
};
const getStatus = async (filter) => {
  const mandatoryStatus = await status.find({ mandatory: true });

  const filteredStatus = await status.find(filter);
  const allStatus = [...mandatoryStatus, ...filteredStatus];

  return allStatus;
};

module.exports = {
  addStatus,
  updateStatus,
  deleteStatus,
  getStatus,
};
