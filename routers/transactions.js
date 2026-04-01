const express = require("express");
const router = express.Router();
const { client } = require("../config/db");

const transactionsCollection = client.db("risk_radar").collection("transactions")

router.get("/",
    async (req, res) => {
        try {
            const transactions = await transactionsCollection.aggregate([
                {
                    $lookup: {
                        from: "payments",
                        localField: "userId",
                        foreignField: "userId",
                        as: "payment"
                    }
                },
                {
                    $addFields: {
                        payment: { $arrayElemAt: ["$payment", 0] }
                    }
                }
            ]).toArray();
            res.status(200).json(transactions);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    })

module.exports = router;