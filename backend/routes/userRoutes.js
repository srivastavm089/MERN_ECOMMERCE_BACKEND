const express = require("express");
const {
  registerUser,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updateUserPassword,
  updateUserProfile,
  getAllUsers,
  getSingleUser,
  updateUserRoll,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/isAuthenticatedUser");
const { authorizeRoles } = require("../middleware/authentication");
const router = express.Router();
router.route("/register").post(registerUser);
router.route("/login").post(login);
router.route("/password/forgot").post(forgotPassword);
router.route("/logout").get(logout);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthenticated, getUserDetails);
router.route("/password/update").put(isAuthenticated, updateUserPassword);
router.route("/me/update").put(isAuthenticated, updateUserProfile);
router
  .route("/admin/users")
  .get(isAuthenticated, authorizeRoles("admin"), getAllUsers);
router
  .route("/admin/user/:id")
  .get(isAuthenticated, authorizeRoles("admin"), getSingleUser)
  .put(isAuthenticated, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteUser);

module.exports = router;
