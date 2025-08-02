const { issue } = require("../models");
const addIssue = async (bodyData) => {
  return await issue.create(bodyData);
};
const getIssues = async () => {
  return await issue.find({});
};
const getUserIssues = async (filter) => {
  return await issue
    .find(filter)
    .populate({
      path: "parentId",
      select: "_id Name UserName companyName",
    })
    .populate({
      path: "userId",
      select: "_id Name UserName",
    })
    .sort({ createdAt: -1 });
};
const getIssue = async (id) => {
  return await issue
    .findById(id)
    .populate({
      path: "parentId",
      select: "_id Name UserName companyName",
    })
    .populate({
      path: "userId",
      select: "_id Name UserName",
    });
};

const updateIssue = async (issueId, updateData) => {
  return await issue.findOneAndUpdate(
    {
      _id: issueId,
    },
    updateData,
    { new: true }
  );
};

// const deleteCity = async (cityId) => {
//   return await city.findOneAndDelete({
//     _id: cityId,
//   });
// };
// const getCity = async (filter) => {
//   return await city.find(filter);
// };

module.exports = {
  addIssue,
  getIssues,
  getIssue,
  getUserIssues,
  updateIssue,
  //   deleteCity,
};
