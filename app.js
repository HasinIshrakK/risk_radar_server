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
app.use("/api/notifications", require("./routers/notification"));
app.use("/api/transactions", require("./routers/transactions"))

const stripe = require("stripe")(process.env.STRIPE_SECRET);


module.exports = app;