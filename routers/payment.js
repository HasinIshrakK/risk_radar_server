const express = require("express");
const router = express.Router();
const axios = require("axios");
const stripeService = require("../services/stripeService");
const { updatePaymentStatus } = require("../controllers/paymentController");

// When user clicks "Pay"
router.post("/checkout", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    // 1. Mandatory Fraud Analysis
    const fraudResponse = await axios.post(`${SERVER_URL}/api/analyze-transaction`, {
      userId,
      amount,
      ipAddress: req.ip // Trusting req.body for IP is a bad idea
    });

    const { status, riskScore } = fraudResponse.data;

    // 2. The Hard Stop (Don't just log it, BLOCK it)
    if (status === "REVIEW_REQUIRED" || riskScore > 80) {
      return res.status(403).json({
        message: "Security check triggered. Your transaction is under manual review.",
        code: "FRAUD_ALERT"
      });
    }

    // 3. Only reach Stripe if the Gatekeeper says "Go"
    const session = await stripeService.createCheckoutSession({
      userId,
      amount,
      metadata: { fraudStatus: status } // Pass status to Stripe for records
    });

    return res.json({ url: session.url });

  } catch (error) {
    console.error("Checkout Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// patch route to update payment status pending to paid from success page
// router.patch("/payment-success", updatePaymentStatus);

module.exports = router;
