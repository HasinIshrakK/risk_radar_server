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
const txnController = require("./controllers/txnController");
app.post("/api/analyze-transaction", txnController.analyzeTransaction);
app.use("/api/users", require("./routers/userRoutes")); 

module.exports = app;
