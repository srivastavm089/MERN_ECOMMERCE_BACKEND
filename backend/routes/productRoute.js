const express = require("express");
const {
  getAllProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getProductReview,
  deleteReview,
  getAdminProducts,
} = require("../controllers/productController");
const { authorizeRoles } = require("../middleware/authentication");
const { isAuthenticated } = require("../middleware/isAuthenticatedUser");
const router = express.Router();
router.route("/products").get(getAllProduct);
router.route("/product/:id").get(getProductDetails);
router
  .route("/admin/products")
  .get(isAuthenticated, authorizeRoles("admin"), getAdminProducts);
router
  .route("/admin/product/new")
  .post(isAuthenticated, authorizeRoles("admin"), createProduct);
router
  .route("/admin/product/:id")
  .put(isAuthenticated, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteProduct)
  .get(getProductDetails);

router.route("/review").put(isAuthenticated, createProductReview);
router
  .route("/reviews")
  .get(getProductReview)
  .delete(isAuthenticated, deleteReview);
module.exports = router;
