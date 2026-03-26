const express = require("express");
const { analyzeRisk } = require("../services/fraudService");
const router = express.Router();
const axios = require("axios");
const stripeService = require("../services/stripeService");
const { updatePaymentStatus } = require("../controllers/paymentController");
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const usersCollection = client.db("risk_radar").collection("users");

// When user clicks "Pay"
router.post("/checkout", async (req, res) => {
  try {
    const { userId, amount, name, email, plansId } = req.body;

    // 1. Mandatory Fraud Analysis
    const fraud = await analyzeRisk({ userId, amount });

    if (!fraud.isSafe) {
      return res.status(403).json({ message: "Blocked: " + fraud.reasons });
    }

    // 2. Only reach Stripe if the Gatekeeper says "Go"
    const session = await stripeService.createCheckoutSession({
      userId,
      amount,
      name,
      email,
      plansId,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error("Checkout Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// patch route to update payment status pending to paid from success page
// router.patch("/payment-success", updatePaymentStatus);

module.exports = router;
