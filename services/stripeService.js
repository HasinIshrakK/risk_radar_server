const stripe = require("stripe")(process.env.STRIPE_SECRET);

const createCheckoutSession = async (paymentInfo) => {
  const amount = parseInt(paymentInfo.price) * 100;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",

          unit_amount: amount,

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
    },

    customer_email: paymentInfo.email,

    success_url: `${process.env.SITE_DOMAIN}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,

    cancel_url: `${process.env.SITE_DOMAIN}/dashboard/payment-cancel`,
  });

  

  return session;
};

module.exports = {
  createCheckoutSession,
};
