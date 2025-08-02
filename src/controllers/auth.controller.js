const { authService, userService, tokenService } = require("../services");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { users, loginLogs } = require("../models");
const ApiError = require("../utils/ApiError");
const {
  sendEmail,
  sendForgotPasswordEmail,
  sendGreetingEmailToAdmin,
} = require("../utils/sendEmail");
const httpStatus = require("http-status");
const { strict } = require("assert");
const catchAsync = require("../utils/catchAsync");

const generateRandomPassword = async (length) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars.charAt(randomIndex);
  }

  return password;
};

const signupAdmin = catchAsync(async (req, res) => {
  const { Email, Password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(Email)) {
    return res.status(400).json({ message: "Please enter a valid email" });
  }
  const { UserType } = req.user;
  /**
   * Creating Admin
   */
  if (UserType == 1) {
    const superAdmin = await userService.getUserByEmail(Email);

    if (superAdmin) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: `user already exists with this email: ${Email}`,
      });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    req.body["Password"] = hashedPassword;

    const newAdmin = await authService.signupAdmin(req.body);

    let setNewPasswordToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(setNewPasswordToken, Number(10));

    const expirationTime = Date.now() + 3 * 24 * 60 * 60 * 1000;

    let tokenPayload = {
      adminId: newAdmin._id,
      token: hash,
      createdAt: Date.now(),
      expiresAt: expirationTime,
    };

    await tokenService.createSetOrForgotPwdToken(tokenPayload);
    const origin = req.get("Origin") || `${req.protocol}://${req.get("host")}`;

    let link = `${origin}/passwordReset?token=${setNewPasswordToken}&id=${newAdmin._id}`;

    const emailData = {
      name: newAdmin.Name,
      link: link,
    };
    const subject = "Welcome to Our CRM! Password Update Required.!";
    await sendGreetingEmailToAdmin(
      newAdmin.Email,
      subject,
      "admin-welcome",
      emailData
    );

    return res.status(httpStatus.CREATED).json({
      message: "Admin created successfully!!",
    });
  }
  /**
   * Creating Admin
   */
  if (UserType == 2) {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Token is required!!",
      });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const myAdmin = await users
        .findOne({ _id: decoded.userId, UserType: 2 })
        .lean();

      if (!myAdmin) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
      }

      const user = await userService.getUserByEmail(Email);

      if (user) {
        return res.status(httpStatus.BAD_REQUEST).json({
          message: `User already exists with this email ${Email}`,
        });
      }

      req.body["Password"] = await bcrypt.hash(Password, 10);
      req.body["parentId"] = decoded.userId;

      let newAdmin = await authService.signupAdmin(req.body);

      let setNewPasswordToken = crypto.randomBytes(32).toString("hex");
      const hash = await bcrypt.hash(setNewPasswordToken, Number(10));

      const expirationTime = Date.now() + 3 * 24 * 60 * 60 * 1000;

      let tokenPayload = {
        userId: newAdmin._id,
        token: hash,
        createdAt: Date.now(),
        expiresAt: expirationTime,
      };

      await tokenService.createSetOrForgotPwdToken(tokenPayload);
      const origin =
        req.get("Origin") || `${req.protocol}://${req.get("host")}`;

      let link = `${origin}/passwordReset?token=${setNewPasswordToken}&id=${newAdmin._id}`;

      const emailData = {
        name: newAdmin.Name,
        link: link,
      };
      const subject = "Welcome to Our CRM! Password Update Required.!";
      await sendGreetingEmailToAdmin(
        newAdmin.Email,
        subject,
        "admin-welcome",
        emailData
      );

      return res.status(httpStatus.CREATED).json({
        message: "User created successfully!!",
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
});

const signupTestingAdmin = catchAsync(async (req, res) => {
  const {
    Email,
    Password,
    Name,
    Phone,
    companyName,
    teamSize,
    testing,
    testingValidity,
  } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(Email)) {
    return res.status(400).json({ message: "Please enter a valid email" });
  }

  const hashedPassword = await bcrypt.hash(Password, 10);
  req.body["Password"] = hashedPassword;
  req.body["testing"] = true;
  let currentDate = new Date();
  req.body["testingValidity"] = currentDate.setDate(currentDate.getDate() + 10);

  const newAdmin = await authService.signupAdmin(req.body);

  let setNewPasswordToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(setNewPasswordToken, Number(10));

  const expirationTime = Date.now() + 3 * 24 * 60 * 60 * 1000;

  let tokenPayload = {
    adminId: newAdmin._id,
    token: hash,
    createdAt: Date.now(),
    expiresAt: expirationTime,
  };

  await tokenService.createSetOrForgotPwdToken(tokenPayload);
  const origin = req.get("Origin") || `${req.protocol}://${req.get("host")}`;

  let link = `${origin}/passwordReset?token=${setNewPasswordToken}&id=${newAdmin._id}`;

  const emailData = {
    name: newAdmin.Name,
    link: link,
  };
  const subject = "Welcome to Our CRM! Password Update Required.!";
  await sendGreetingEmailToAdmin(
    newAdmin.Email,
    subject,
    "admin-welcome",
    emailData
  );

  return res.status(httpStatus.CREATED).json({
    message: "Admin created successfully!!",
  });
});

function generateJTI() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString().substring(2, 8);
  const jti = timestamp + random;
  return jti;
}

const signIn = catchAsync(async (req, res) => {
  const { Email, Password, type } = req.body;
  try {
    const user = await userService.getUserByEmail(Email);
    // console.log(user);

    if (!user) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Invalid email" });
    }

    if (user.testing) {
      let testingValidityDate = new Date(user.testingValidity);
      let date = new Date();
      if (testingValidityDate < date) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          message:
            "Demo Validity period expired. Please contact the administrator!",
        });
      }
    }

    const currentDate = new Date();
    if (currentDate > user.validupTo) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Contract validity period expired. Please contact the admin!",
      });
    }

    if (!user.active) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "User is inactive. Please contact the admin!",
      });
    }

    if (user.appTypes.includes(type)) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "User is already logged in another device!",
      });
    }

    const isPasswordMatched = await bcrypt.compare(
      Password.trim(),
      user.Password
    );

    if (!isPasswordMatched) {
      // console.log("uyes it is in tis");
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Password does not match!" });
    }

    const tokenPayload = {
      appType: type === "web" ? "web" : "app",
      jti: generateJTI(),
      role: user.role,
      name: user.Name,
      UserType: user.UserType,
      Permission: user.Permission,
    };

    if (user.UserType === 1) {
      tokenPayload.userId = user._id;
    } else if (user.UserType === 2) {
      tokenPayload.userId = user._id;
      tokenPayload.parentId = null;
    } else if (user.UserType === 3) {
      tokenPayload.userId = user._id;
      tokenPayload.parentId = user.parentId;
    }

    const token = tokenService.generateToken(tokenPayload);

    await new loginLogs({
      userId: user._id,
      type: 2,
      token: token,
    }).save();

    user.appTypes.push(type);
    if (type === "app") {
      user.appJtis.push(tokenPayload.jti);
    } else if (type === "web") {
      user.webJtis.push(tokenPayload.jti);
    }

    await user.save();

    res.cookie(String("token"), token, {
      path: "/",
      maxAge: 900000,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    const userData = {
      crmKey: user.crmKey,
      userId: user._id,
      UserName: user.UserName,
      City: user.City,
      Phone: user.Phone,
      Name: user.Name,
      Email: user.Email,
      role: user.role,
      UserType: user && user.UserType,
      UserProfile: user.UserProfile,
      pin: !!user.pin,
      menuPermissions: user.menuPermissions,
      Permission: user.Permission,
      permissionAccess: user.permissionAccess,
      image: user.image,
    };

    return res.status(httpStatus.OK).json({
      message: "Success",
      statusCode: httpStatus.OK,
      token: token,
      userData,
    });
  } catch (error) {
    console.error("Error in signIn:", error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "An error occurred during sign-in. Please try again later.",
    });
  }
});

const signout = catchAsync(async (req, res) => {
  const token =
    req.cookies?.token || (req.headers["authorization"] || "").split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { type } = req.body;
  const user = await userService.getUserById(req.user.userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Remove the app type from user's app types and corresponding jti
  if (user.appTypes.includes(type)) {
    user.appTypes = user.appTypes.filter((appType) => appType !== type);

    if (type === "app") {
      user.appJtis = user.appJtis.filter((jti) => jti !== req.user.jti);
    } else if (type === "web") {
      user.webJtis = user.webJtis.filter((jti) => jti !== req.user.jti);
    }

    await user.save();
    res.clearCookie("token");
    return res.status(200).json({
      message: "Logged out successfully",
    });
  } else {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
});

const createPin = catchAsync(async (req, res) => {
  const { _id } = req.user;
  const { pin, confirmPin } = req.body;

  const user = await users.findOneAndUpdate({ _id: _id }, { pin: pin });

  // Remove the app type from user's app types
  const index = user.appTypes.indexOf("app");
  if (index !== -1) {
    user.appTypes.splice(index, 1);
  }
  const jtiIndex = user.appJtis.indexOf(req.user.jti);
  if (jtiIndex !== -1) {
    user.appJtis;

    user.appJtis.splice(jtiIndex, 1);
  }

  // Generate a unique jti value
  const jti = generateJTI();

  user.appTypes.push("app");
  user.appJtis.push(jti);

  await user.save();
  let tokenPayload = {
    userId: user._id,
    appType: "app",
    jti: jti,
    role: user.role,
    name: user.Name,
  };

  const token = tokenService.generateToken(tokenPayload);
  res.cookie(String("token"), token, {
    path: "/",
    httpOnly: true,
    overwrite: true,
  });

  return res.status(200).json({
    statusCode: 200,
    message: "Pin Created SuccessFully",
    token: token,
    user: user,
    _id: _id,
  });
});

const loginWithPin = catchAsync(async (req, res) => {
  const { _id, pin } = req.body;

  //const user = await users.findOne({ _id: _id });

  let user = await userService.getUserById(_id);
  delete user["pin"];
  delete user.pin;

  if (pin != user.pin) {
    return res.status(400).json({
      message: "pin does not matched!!",
    });
  }
  if (pin == user.pin) {
    let tokenPayload = {
      userId: user._id,
      appType: "app",
      jti: user.appJtis[0],
      role: user.role,
      name: user.Name,
    };
    const token = tokenService.generateToken(tokenPayload);

    res.cookie(String("token"), token, {
      path: "/",
      httpOnly: true,
    });

    return res.status(200).json({
      statusCode: 200,
      message: "LogIn Successful",
      token,
      user,
    });
    res.cookie(String("token"), token.access.token, {
      path: "/",
      httpOnly: true,
      overwrite: true,
    });
    return res.status(200).json({
      statusCode: 200,
      message: "LogIn Successful",
      token: token.access.token,
    });
  }
});

const requestForgotPassword = catchAsync(async (req, res) => {
  const user = await userService.getUserByEmail(req.body.Email);
  if (!user) {
    return res.status(400).json({
      message: "user does not exist!!",
    });
  }
  let token = await tokenService.getTokenByUserId(user._id);
  if (token) {
    await tokenService.deleteTokenByUserID(user._id);
  }
  let resetToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(resetToken, Number(10));

  let tokenPayload = {
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  };
  await tokenService.createSetOrForgotPwdToken(tokenPayload);

  const forgotPasswordUrl = `http://localhost:3000/password-set?token=${resetToken}&id=${user._id}`;

  const message = `Hello ${user.Name},\n\n, There is an attempt to Reset your Password for your Profile for the CRM.\nIf you did not try to do so,  make sure no one else has access to this email and relax.\nif you do want to reset the Password then Here is the link:\n\n ${forgotPasswordUrl}`;

  await sendForgotPasswordEmail({
    email: req.body.Email,
    subject: `Lead-Management Password Recovery`,
    message,
  });

  return res.status(200).json({
    message: `Email sent to ${user.Email} successfully`,
    link: forgotPasswordUrl,
  });
});

const ForgotPassword = catchAsync(async (req, res) => {
  const { token, id, Password } = req.body;

  const tokenDoc = await tokenService.getTokenByUserId(id);

  if (!tokenDoc) {
    return res.status(400).json({
      message: "Invalid or expired token",
    });
  }

  const incomingTokenHash = await bcrypt.compare(token, tokenDoc.token);

  if (!incomingTokenHash) {
    return res.status(400).json({
      message: "Invalid or expired token",
    });
  }

  const newHashedPwd = await bcrypt.hash(Password, Number(10));

  await userService.updateUser(id, {
    Password: newHashedPwd,
    webJtis: [],
    appJtis: [],
    appTypes: [],
  });
  await tokenService.deleteTokenByUserID(id);

  return res.status(200).json({
    message: "Password reset successfully!",
  });
});

const updatePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const { userId } = req.user;
  let { type } = req.body;

  const user = await userService.getUserById(userId);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  if (newPassword != confirmPassword) {
    return res.status(404).json({
      success: false,
      message: "New password and confirm password does not matched!",
    });
  }

  const decPassord = await bcrypt.compare(currentPassword, user.Password);
  if (!decPassord) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "current password does not matched!",
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
  user["Password"] = newPassword;
  await user.save();

  return res.status(httpStatus.OK).json({
    success: true,
    message: "password succssfully updated!",
  });
});

module.exports = {
  signupAdmin,
  signIn,
  signout,
  createPin,
  loginWithPin,
  requestForgotPassword,
  ForgotPassword,
  updatePassword,
  signupTestingAdmin,
};
