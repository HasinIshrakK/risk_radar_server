const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/payment", require("./routers/payment"));
const txnController = require("./controllers/txnController");
app.post("/api/analyze-transaction", txnController.analyzeTransaction);

module.exports = app;
