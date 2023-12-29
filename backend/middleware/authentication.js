exports.authorizeRoles = (...rols) => {

  return (req, res, next) => {
    if (!rols.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role: ${req.user.role} is not allowed to access this resource`,
      });
    }
    next();
  };
};
