const express = require("express");
const { isAuthenticated } = require("../middleware/isAuthenticatedUser");
const { newOrder, getSingleOrder, myOrder, getAllOrder, updateOrder, deleteOrder } = require("../controllers/orderController");
const { authorizeRoles } = require("../middleware/authentication");
const router = express.Router();




router.route("/order/new").post(isAuthenticated, newOrder);
router.route("/order/:id").get(isAuthenticated, authorizeRoles("admin"), getSingleOrder);
router.route("/orders/me").get(isAuthenticated,myOrder)
router.route("/admin/orders").get(isAuthenticated, authorizeRoles("admin"), getAllOrder)
router.route("/admin/order/:id").put(isAuthenticated, authorizeRoles("admin"), updateOrder).delete(isAuthenticated, authorizeRoles("admin"), deleteOrder);

module.exports = router