const { branch } = require("../models");
const addBranch = async (bodyData) => {
  return await branch.create(bodyData);
};
const updateBranch = async (branchId, updateData) => {
  return await branch.findOneAndUpdate(
    {
      _id: branchId,
    },
    updateData,
    { new: true }
  );
};
const deleteBranch = async (branchId) => {
  return await branch.findOneAndDelete({
    _id: branchId,
  });
};
const getBranch = async (filter) => {
  return await branch.find(filter);
  // .populate("userId");
};

module.exports = {
  addBranch,
  updateBranch,
  deleteBranch,
  getBranch,
};
