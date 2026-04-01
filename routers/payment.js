const express = require("express");
const { analyzeRisk } = require("../services/fraudService");
const router = express.Router();
const stripeService = require("../services/stripeService");
const { updatePaymentStatus } = require("../controllers/paymentController");
const { client } = require("../config/db");

const paymentsCollection = client.db("risk_radar").collection("payments");

//Fetching payment data
router.get("/", async (req, res) => {
  const { email, limit } = req.query;
  const lim = parseInt(limit) || (!limit && 100);

  try {
    // If an email is provided, find the LATEST payment for that specific user
    if (email) {
      const latestPayment = await paymentsCollection
        .find({ email: email })
        .sort({ _id: -1 }) // Sort by MongoDB ID (which includes timestamp) to get the newest
        .limit(lim)
        .toArray();

      if (latestPayment.length === 0) {
        return res.status(404).json({ message: "No subscription found for this user." });
      }

      return res.status(200).json(latestPayment);
    }

    // If NO email is provided, return all payments (Admin view)
    const allPayments = await paymentsCollection.find({}).toArray();
    res.status(200).json(allPayments);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
