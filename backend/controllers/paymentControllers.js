const { config } = require("dotenv");
const path = require("path");
const p = path.resolve();
config({ path: `${p}/backend/config/.env` });

const key = process.env.STRIPE_SECRET;
const stripe = require("stripe")(key);

exports.processPayment = async (req, res) => {
  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    metadata: {
      company: "Ecommerce",
    },
  });
  console.log("wroking");
  res.status(200).json({
    success: true,
    client_secret: myPayment.client_secret,
  });
};

exports.sendStripeKey = async (req, res) => {
  res.status(200).json({
    stripeApiKey: process.env.STRIPE_API_KEY,
  });
};
