require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Redis = require("redis"); 
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

const redisClient = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Redis connection logic
(async () => {
    try {
        await redisClient.connect();
        console.log("Connected to Redis");
    } catch (err) {
        console.error("Redis Connection Error:", err);
    }
})();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASS}@cluster0.rwnir9j.mongodb.net/risk_radar`;
const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function run() {
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB.");

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

        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
}

run().catch(console.dir);
