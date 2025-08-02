const { city } = require("../models");
const addCity = async (bodyData) => {
  return await city.create(bodyData);
};
// const updateCity = async (cityId, updateData) => {
//   console.log("up", updateData);
//   return await city.findOneAndUpdate(
//     {
//       _id: cityId,
//     },
//     {
//       cityName: updateData.CityName,
//     },
//     { new: true }
//   );
// };

//updated updateCity
const updateCity = async (cityId, updateData) => {
  console.log("up", updateData);
  return await city.findOneAndUpdate(
    { 
      _id: cityId 
    },
    {
      cityName: updateData.CityName,
      branchId: updateData.branchId,
    },
    { new: true }
  );
};


const deleteCity = async (cityId) => {
  return await city.findOneAndDelete({
    _id: cityId,
  });
};
const getCity = async (filter) => {
  return await city.find(filter);
  // .populate({
  //   path: "branchId",
  //   model: "branch",
  //   populate: {
  //     path: "userId",
  //     model: "user",
  //   },
  //   populate: {
  //     path: "parentId",
  //     model: "user",
  //   },
  // });
};

module.exports = {
  addCity,
  updateCity,
  deleteCity,
  getCity,
};
