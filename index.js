require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Redis = require("redis");
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
// middleware
app.use(cors());
app.use(express.json());

// connect redis
const redisClient = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.on("error", (err) => console.log("Redis Client Error", err));


// Redis connection logic
(async () => {
    try {
        await redisClient.connect();
        // console.log("Connected to Redis");
        console.log("Redis Connected Successfully ");

    } catch (err) {
        console.error("Redis Connection Error:", err);
    }
})();

// Mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASS}@cluster0.rwnir9j.mongodb.net/risk_radar`;
const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function run() {
    try {
        // 
        await client.connect();
        console.log("Successfully connected to MongoDB.");
        const db = client.db("risk_radar");
        const transactionCollection = db.collection("transaction");


        app.get('/', async (req, res) => {
            try {
                const otp = Math.floor(100000 + Math.random() * 900000).toString();

                await redisClient.setEx("otp", 300, otp);

                console.log("Generated OTP:", otp);
                res.status(200).json({ message: 'RiskRadar API is healthy', status: 'success' });
            } catch (error) {
                console.error("Redis Operation Error:", error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });

        // creating basic transaction api

        app.post("/transaction", async (req, res) => {
            try {
                const { userId, amount } = req.body;

                if (!userId || !amount) {
                    return res.status(400).json({ message: "userId and amount required" });
                }

                // redis coint
                const key = `rapid_tx:${userId}`;

                const count = await redisClient.incr(key);

                // set ttl 2 min
                if (count === 1) {
                    await redisClient.expire(key, 120);
                }

                // Risk Logic
                let riskScore = count * 20;
                let status = "SAFE";
                let alert = false;
                let reason = "";

                if (count >= 3) {
                    status = "Review required";
                    alert = true;
                    reason = "Multiple rapid transaction detected within 2 minutes";
                }
                // MONGODB SAVE

                await transactionCollection.updateOne(
                    {userId: userId},
                    {
                        $set: {
                            lastAmount: amount,
                            riskScore: riskScore,
                            status: status,
                            alert: alert,
                            reason: reason,
                            lastUpdated: new Date()
                        },
                        
                         $inc:{
                            totalTransaction: 1
                         },
                         $setOnInsert:{
                            createdAt: new Date()
                         },
                        
                    },
                    {
                        upsert:true
                    }
                );

                res.status(200).json({
                    userId,
                    transactionCountLast5Min: count,
                    riskScore,
                    status,
                    alert,
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Something went wrong" });
            }
        });

        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
}

run().catch(console.dir);