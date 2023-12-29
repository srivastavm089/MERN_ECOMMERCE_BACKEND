const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/userModal");
exports.isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decode.id);

    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401).json({
        success: false,
        message: "not authorized",
      });
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "login to access this resources",
    });
  }
};
