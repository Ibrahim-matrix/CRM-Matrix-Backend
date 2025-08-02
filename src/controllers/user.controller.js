const mongoose = require("mongoose");
const userModel = require("../models/user.model");
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { userService, tokenService } = require("../services");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendGreetingEmailToUser } = require("../utils/sendEmail");
const { users } = require("../models");

const addUser = catchAsync(async (req, res) => {
  if (req.user.UserType == 3 || req.user.UserType == 1) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: "permission denied",
    });
  }
  const { Email } = req.body;
  const user = await userService.getUserByEmail(Email);
  if (user) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: `user already exists with this email: ${Email}`,
    });
  }
  //req.body['image'] = req.file.location;
  req.body["UserType"] = 3;
  req.body["Permission"] = req.body.Permission;
  req.body["parentId"] = req.user.userId;
  req.body["Password"] = "user@123";
  const addUser = await userService.addUser(req.body);

  let setNewPasswordToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(setNewPasswordToken, Number(10));

  let tokenPayload = {
    userId: addUser._id,
    token: hash,
    createdAt: Date.now(),
  };
  await tokenService.createSetOrForgotPwdToken(tokenPayload);

  let link = `http://localhost:3000/password-set?token=${setNewPasswordToken}&id=${addUser._id}`;

  const emailData = {
    name: addUser.Name,
    link: link,
  };
  const subject = "Welcome to Our CRM! Password Update Required.!";
  await sendGreetingEmailToUser(
    addUser.Email,
    subject,
    "user-welcome",
    emailData
  );
  // await sendGreetingEmailToUser({
  //   email: addUser.Email,
  //   subject: `Welcome to Our Lead Management System! Password Update Required.`,
  //   htmlMsg,
  // });
  return res.status(httpStatus.CREATED).json({
    message: "User created successfully!!",
    Data: addUser,
  });
});

const updateMenuPermissions = catchAsync(async (req, res) => {
  if (req.user.UserType == 3) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: "permission denied",
    });
  }

  const exist = users.findById(req.user.userId);
  if (!exist) {
    return res.status(400).send({
      success: false,
      message: "User does not exist",
    });
  }

  const { menuPermissions } = req.body;
  console.log(menuPermissions);

  const user = await users.findByIdAndUpdate(
    req.user.userId,
    { menuPermissions },
    { new: true }
  );

  return res.status(httpStatus.CREATED).json({
    message: "Menu updated successfully!!",
    Data: user,
  });
});

// const updateUser = catchAsync(async (req, res) => {
//   console.log(req.body);
//   const updateUser = await userService.updateUser(req.params.id, req.body);
//   return res.status(httpStatus.CREATED).json({
//     message: "User updated successfully!!",
//     Data: updateUser,
//   });
// });


// const updateUser = catchAsync(async (req, res) => {
//   const { Password, currentPassword, ...restData } = req.body
//   console.log(req.body);

//   const user = await users.findById(req.params.id)
//   if (!user) {
//     return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
//   }

//   const updateData = { ...restData }

//   if (Password) {
//     if (currentPassword) {
//       const isMatch = await bcrypt.compare(currentPassword, user.Password)
//       if (!isMatch) {
//         return res.status(httpStatus.UNAUTHORIZED).json({
//           message: "Current password is incorrect",
//         });
//       }
//     }

//     const isSameAsOld = await bcrypt.compare(Password, user.Password);
//     if (isSameAsOld) {
//       return res.status(httpStatus.BAD_REQUEST).json({
//         message: "New password cannot be same as old password",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(Password, 10)
//     updateData.Password = hashedPassword
//   }

//   const updateUser = await userService.updateUser(req.params.id, updateData);
//   return res.status(httpStatus.CREATED).json({
//     message: "User updated successfully!!",
//     Data: updateUser,
//   });
// });

// const updateUser = catchAsync(async (req, res) => {
//   const { Password, currentPassword, ...restData } = req.body;

//   const user = await users.findById(req.params.id);
//   if (!user) {
//     return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
//   }

//   let updateData = {};

//   // ✅ If only Password is sent
//   if (Password && Object.keys(restData).length === 0) {
//     if (!currentPassword) {
//       return res.status(httpStatus.BAD_REQUEST).json({
//         message: "Current password is required to update the password",
//       });
//     }

//     const isMatch = await bcrypt.compare(currentPassword, user.Password);
//     if (!isMatch) {
//       return res.status(httpStatus.UNAUTHORIZED).json({
//         message: "Current password is incorrect",
//       });
//     }

//     const isSameAsOld = await bcrypt.compare(Password, user.Password);
//     if (isSameAsOld) {
//       return res.status(httpStatus.BAD_REQUEST).json({
//         message: "New password cannot be same as old password",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(Password, 10);
//     updateData.Password = hashedPassword;
//   }

//   // ✅ If only other fields (excluding password) are sent
//   else if (!Password && Object.keys(restData).length > 0) {
//     updateData = { ...restData };
//   }

//   // ✅ If both are sent together (optional — you can disallow if you prefer)
//   else if (Password && Object.keys(restData).length > 0) {
//     return res.status(httpStatus.BAD_REQUEST).json({
//       message: "Cannot update password and user data together. Please update separately.",
//     });
//   }

//   const updatedUser = await userService.updateUser(req.params.id, updateData);
//   return res.status(httpStatus.CREATED).json({
//     message: "User updated successfully!",
//     Data: updatedUser,
//   });
// });

const updateUser = catchAsync(async (req, res) => {
  const { Password, currentPassword, ...restData } = req.body;

  const user = await users.findById(req.params.id);
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
  }

  // === Case 1: Only Password update ===
  if (Password && Object.keys(restData).length === 0) {
    if (!currentPassword) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Current password is required to update the password",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.Password);
    if (!isMatch) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Current password is incorrect",
      });
    }

    const isSameAsOld = await bcrypt.compare(Password, user.Password);
    if (isSameAsOld) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "New password cannot be same as old password",
      });
    }

    // const hashedPassword = await bcrypt.hash(Password, 10);
    user.Password = Password;
    await user.save();

    return res.status(httpStatus.OK).json({
      message: "Password updated successfully!",
    });
  }

  // === Case 2: Only other data update ===
  if (Object.keys(restData).length > 0) {
    // ❗ Ensure password is not updated through this path
    if ("Password" in restData) delete restData.Password;
    if ("currentPassword" in restData) delete restData.currentPassword;

    const updatedUser = await userService.updateUser(req.params.id, restData);
    return res.status(httpStatus.OK).json({
      message: "User data updated successfully!",
      Data: updatedUser,
    });
  }

  return res.status(httpStatus.BAD_REQUEST).json({
    message: "No valid data provided to update.",
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const deleteUser = await userService.deleteUser(req.params.userId);
  return res.status(httpStatus.CREATED).json({
    message: "User deleted successfully!!",
    Data: deleteUser,
  });
});

const getUsers = catchAsync(async (req, res) => {
  let filter = {};
  filter["UserType"] = 3;

  const { branchId, _id } = req.query;

  if (_id) {
    filter["_id"] = _id;
  }
  if (branchId) {
    filter["branchId"] = branchId;
  }

  if (req.user.UserType == 2) {
    filter["parentId"] = req.user.userId;
  }
  if (req.user.UserType == 3) {
    if (Array.isArray(req.user.Permission) && req.user.Permission.length > 0) {
      const permittedUserId = req.user.Permission.map(p => p.userId)
      permittedUserId.push(req.user.userId)
      filter = {
        parentId: req.user.parentId,
        _id: { $in: permittedUserId },
      }
    }
  }

  // console.log("FILTER USED:", req.user);

  let users = await userService.getUsers(filter);
  // if (req.user.UserType == 3) {
  //   let myUser = { ...users[0] };
  //   let impData = myUser?._doc?.userPermissions;
  //   delete myUser?._doc?.userPermissions;
  //   users = impData;
  //   users.push(myUser._doc);
  // }

  return res.status(200).json({
    message: "success!!",
    Data: users,
  });
});

const getUserById = catchAsync(async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const addCrmKey = catchAsync(async (req, res) => {
  const { crmKey, userId } = req.body;
  if (crmKey && crmKey != "") {
    let data = await users.findByIdAndUpdate(userId, { crmKey }, { new: true });
    return res.status(201).json({
      success: true,
      message: "key updated succssfully!!",
      Data: data,
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "Crm Key is required",
    });
  }
});

module.exports = {
  addCrmKey,
  addUser,
  updateUser,
  deleteUser,
  getUsers,
  getUserById,
  updateMenuPermissions,
};
