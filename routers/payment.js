const express = require("express");
const { analyzeRisk } = require("../services/fraudService");
const router = express.Router();
const stripeService = require("../services/stripeService");
const { updatePaymentStatus } = require("../controllers/paymentController");



// When user clicks "Pay"
router.post("/checkout", async (req, res) => {
  try {
    const { userId, amount, name, email, plansId } = req.body;

    //  Fraud Check
    const fraud = await analyzeRisk({ userId, amount });

    if (!fraud.isSafe) {
      return res.status(403).json({
        message: `Transaction Blocked (${fraud.status})`,
        reason: fraud.reasons,
      });
    }

    //  Stripe Session
    const session = await stripeService.createCheckoutSession({
      userId,
      amount,
      name,
      email,
      plansId,
      fraudScore: fraud.riskScore,
    });

    return res.json({ url: session.url });

  } catch (error) {
    console.error("Checkout Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// patch route to update payment status pending to paid from success page
router.patch("/payment-success", updatePaymentStatus);

module.exports = router;
