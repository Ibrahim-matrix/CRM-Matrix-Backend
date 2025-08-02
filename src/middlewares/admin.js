const isAdmin = (req, res, next) => {
  console.log("my user-------", req.user);

  if (req.user.UserType !== 2) {
    return res.status(401).send({
      success: false,
      message: "Unauthorized",
    });
  }
  next();
};
const isSuperAdmin = (req, res, next) => {
  console.log("aaadass", req.user);

  if (req.user.UserType !== 1) {
    return res.status(401).send({
      success: false,
      message: "Unauthorized User",
    });
  }
  next();
};

module.exports = {
  isAdmin,
  isSuperAdmin,
};
