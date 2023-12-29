const express = require("express");
const router = express.Router()
const {isAuthenticated} = require("../middleware/isAuthenticatedUser");
const { processPayment, sendStripeKey } = require("../controllers/paymentControllers");

router.route("/payment/process").post(isAuthenticated, processPayment);
router.route("/stripeapikey").get(isAuthenticated, sendStripeKey )

module.exports = router