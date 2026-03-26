const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Global Health Check
app.get("/", (req, res) => {
    res.status(200).json({ status: "API is healthy" });
});

// Routes
app.use("/api/payment", require("./routers/payment"));
app.use("/api/users", require("./routers/userRoutes"));
const stripe = require("stripe")(process.env.STRIPE_SECRET);

app.post('/create-checkout-session', async (req, res) => {
    const paymentInfo = await req.body;
    const amountInCents = Math.round(500 * 100);
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

    console.log(session)
    res.send({ url: session.url });
});

module.exports = app;
