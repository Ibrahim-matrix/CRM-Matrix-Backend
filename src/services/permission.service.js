const { permissions } = require("../models");
const addPermission = async (permissionData) => {
  return await permissions.create(permissionData);
};
const getPermission = async()=>{
return await permissions.find({})
}

module.exports = {
  addPermission,
  getPermission
};
