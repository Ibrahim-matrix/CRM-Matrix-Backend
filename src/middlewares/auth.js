const jwt = require("jsonwebtoken");
const { users, loginLogs } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

// Function to extract User Data from the JWT token without verification
const extractData = async (token) => {
  const decodedToken = jwt.decode(token);
  if (decodedToken) {
    return decodedToken;
  }
  return null;
};
const auth = async (req, res, next) => {
  {
    // const token =
    //   req.cookies?.token || req.headers["authorization"]?.split(" ")[1];
    // if (!token) {
    //   return res.status(401).send({ message: "Unauthorized" });
    // }
    // try {
    //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //   const user = await users.findById(decoded.userId).lean();

    //   if (!user) {
    //     throw new ApiError(httpStatus.UNAUTHORIZED, "unauthorized");
    //   }

    //   if (user && (user.UserType == 1 || user.UserType == 2 || user.UserType == 3)) {
    //     req.user = decoded;
    //     return next();
    //   }
    //   const jti = decoded.jti;

    //   const appType = decoded.appType;
    //   const jtiExists =
    //     appType === "app"
    //       ? user.appJtis.includes(jti)
    //       : user.webJtis.includes(jti);

    //   if (!jtiExists) {
    //     return res.status(401).json({ message: "Invalid token" });
    //   }
    //   let data = { ...decoded, ...user };
    //   req.user = data;
    //   return next();
    // } catch (error) {
    //   if (error.name == "TokenExpiredError") {
    //     const decodedData = await extractData(token);
    //     if (decodedData) {
    //       const { userId, type } = decodedData;
    //       let user = await users.findOne({ _id: userId });
    //       if (type == "web") {
    //         user.webJtis = [];
    //       }
    //       if (type == "app") {
    //         user.appJtis = [];
    //       }
    //       // Remove the app type from user's app types
    //       const index = user.appTypes.indexOf(type);
    //       if (index !== -1) {
    //         user.appTypes.splice(index, 1);
    //       }
    //       await user.save();
    //     }
    //   }
    //   return res.status(403).json({
    //     message: error.message,
    //   });
    // }
  }

  try {
    const token =
      req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await users.findById(decoded.userId).lean();

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    if (user.UserType === 1 || user.UserType === 2 || user.UserType === 3) {
      req.user = { ...decoded, ...user, userId: user._id };
      return next();
    }
    const jti = decoded.jti;
    const appType = decoded.appType;
    const jtiExists =
      appType === "app"
        ? user.appJtis.includes(jti)
        : user.webJtis.includes(jti);

    if (!jtiExists) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const data = { ...decoded, ...user };
    req.user = data;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const decodedData = await extractData(token);
      if (decodedData) {
        const { userId, type } = decodedData;
        const user = await users.findOne({ _id: userId });
        if (type === "web") {
          user.webJtis = [];
        }
        if (type === "app") {
          user.appJtis = [];
        }
        const index = user.appTypes.indexOf(type);
        if (index !== -1) {
          user.appTypes.splice(index, 1);
        }
        await user.save();
      }
    }
    return res.status(403).json({
      message: error.message,
    });
  }
};

module.exports = auth;
