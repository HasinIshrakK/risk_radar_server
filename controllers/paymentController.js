const { client } = require("../config/db");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const updatePaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    // Stripe session fetch
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const paymentIntentId = session.payment_intent; // pi_xxx

    const paymentsCollection = client.db("risk_radar").collection("payments");

    const result = await paymentsCollection.updateOne(
      { sessionId },
      { $set: { status: "paid", txnId: paymentIntentId } }
    );

    res.status(200).json({
      message: "Payment updated successfully",
      txnId: paymentIntentId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { updatePaymentStatus };

