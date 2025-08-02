const { users } = require("../models");

const signupAdmin = async (adminData) => {
  return await users.create(adminData);
};

module.exports = {
  signupAdmin,
};
