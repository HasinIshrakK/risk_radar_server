const express = require("express");
const router = express.Router();
const axios = require("axios");
const stripeService = require("../services/stripeService");

// When user clicks "Pay"
router.post("/checkout", async (req, res) => {
  try {
    const { userId, amount, ipAddress } = req.body;

    const transactionData = {
      userId,
      amount,
      ipAddress,
      timestamp: new Date().toISOString(),
      device: req.headers["user-agent"],
    };

    // Calling fraud API
    const fraudResponse = await axios.post(
      "http://localhost:3000/api/analyze-transaction",
      transactionData,
      // {
      //     headers: {
      //         "x-api-key": process.env.FRAUD_API_KEY
      //     }
      // }
    );

    const { riskScore, status } = fraudResponse.data;

    // Decide what to do
    if (status === "REVIEW_REQUIRED") {
      return res.status(403).json({
        message: "Transaction review rquired due to high fraud risk",
      });
    }

    // If safe → proceed to Stripe or payment gateway
    // return res.status(200).json({
    //     message: "Transaction approved. Proceeding to payment..."
    // });

    const session = await stripeService.createCheckoutSession(req.body);

    return res.send({
      url: session.url,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Payment processing failed",
    });
  }
});

module.exports = router;
