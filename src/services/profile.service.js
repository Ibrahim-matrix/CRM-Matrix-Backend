const { users } = require("../models");
const {ObjectId} = require('mongodb')
const getProfile = async (userId) => {
  return await users.aggregate([
    {
      $match: {
        _id: new ObjectId(userId),
      },
    },
    {
      $project: {
        Password:0,
        PasswordUpdatedAt:0,
        updatedAt:0,
        webJtis:0,
        appJtis:0,
        __v:0
      },
    },
  ]);
};
module.exports = {
  getProfile,
};
