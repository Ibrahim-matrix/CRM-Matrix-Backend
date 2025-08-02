const httpStatus = require("http-status");


const cacheMiddleware = async (req, res, next) => {
  const redisClient = req.app.get("redisClient");

  const key = req.originalUrl;

  try {
    let data = await redisClient.get(key);
    if (data !== null) {
      return res.status(httpStatus.OK).json({
        message: "courses",
        Data: JSON.parse(data),
      });
    } else {
      next();
    }
  } catch (error) {
    // return res.status(error).json({
    //   message: error,
    // });
  }
};

module.exports = {
  cacheMiddleware,
};
