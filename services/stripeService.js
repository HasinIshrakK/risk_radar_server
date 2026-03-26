const { client } = require('../config/db');
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const createCheckoutSession = async (paymentInfo) => {
  const rawAmount = Number(paymentInfo.amount);

  if (isNaN(rawAmount) || rawAmount <= 0) {
    throw new Error("Invalid payment amount");
  }

  const amountInCents = Math.round(rawAmount * 100);

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amountInCents,
          product_data: {
            name: `Please pay for: ${paymentInfo.name}`,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",

    metadata: {
      plansId: paymentInfo.plansId,
      plansName: paymentInfo.name,
      userId: paymentInfo.userId,
    },

    customer_email: paymentInfo.email,

    success_url: `${process.env.SITE_DOMAIN}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.SITE_DOMAIN}/dashboard/payment-cancel`,
  });

  // mongodb save

  const paymentsCollection = client.db("risk_radar").collection("payments")
  await paymentsCollection.insertOne({
    userId: paymentInfo.userId,
    email: paymentInfo.email,
    planName: paymentInfo.name,
    planId: paymentInfo.plansId,
    price: rawAmount,
    sessionId: session.id,
    status: "pending",
    createdAt: new Date(),
  });

  return session;
};

module.exports = {
  createCheckoutSession,
};