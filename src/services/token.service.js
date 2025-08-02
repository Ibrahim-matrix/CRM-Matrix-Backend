const {token} = require('../models')
const jwt = require('jsonwebtoken')
const generateToken = (tokenPayload, secret = process.env.JWT_SECRET) => {

  return jwt.sign(tokenPayload, secret, { expiresIn: "30d" });
};
const getTokenByUserId = async (userId) => {
  return await token.findOne({userId:userId})
}
const deleteTokenByUserID = async (userId) => {
  return await token.findOneAndDelete({userId:userId})
}
const createSetOrForgotPwdToken = async (tokenPayload) => {
  return await token.create(tokenPayload);
}

module.exports = {
  generateToken,
  getTokenByUserId,
  deleteTokenByUserID,
  deleteTokenByUserID,
  createSetOrForgotPwdToken,
};