const { profileService, userService } = require("../services");
const catchAsync = require("../utils/catchAsync");

const getOwnProfile = catchAsync(async (req, res) => {
  let { userId } = req.user;
  const profile = await profileService.getProfile(userId);
  return res.status(200).json({
    Data: profile,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  // const {Name, UserName, City,Phone} = req.body;
  const { userId } = req.user;
  let { type } = req.body;

  let obj = {
    ...req.body,
  };

  delete obj.type;

  const user = await userService.getUserById(userId);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not found",
    });
  }

  // Remove the app type from user's app types
  const index = user.appTypes.indexOf(type);
  if (index !== -1) {
    user.appTypes.splice(index, 1);
  }

  // Remove the corresponding jti from the appropriate array
  if (type === "app") {
    const jtiIndex = user.appJtis.indexOf(req.user.jti);
    if (jtiIndex !== -1) {
      user.appJtis.splice(jtiIndex, 1);
    }
  } else if (type === "web") {
    const jtiIndex = user.webJtis.indexOf(req.user.jti);
    if (jtiIndex !== -1) {
      user.webJtis.splice(jtiIndex, 1);
    }
  }
  await userService.updateUser(user._id, obj);

  return res.status(200).json({
    success: true,
    message: "Profile successfully updated!",
  });
});

module.exports = {
  getOwnProfile,
  updateProfile,
};
