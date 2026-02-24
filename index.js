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
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Redis = require("redis");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

// Create Redis client
const redisClient = Redis.createClient({
  url: "redis://localhost:6379",
});
redisClient.on("error", (err) => console.log("Redis Client Error", err));

(async () => {
  await redisClient.connect();
  console.log("Redis Connected Successfully ✅");

  // Test set/get
  await redisClient.set("user:123:txn_count", 5);
  const count = await redisClient.get("user:123:txn_count");
  console.log("Transaction count from Redis:", count);
})();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- MongoDB Configuration ---
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASS}@cluster0.rwnir9j.mongodb.net/risk_radar`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// --- Database Connection & Server Start ---
async function run() {
  try {
    await client.connect();

    const db = client.db("risk_radar");
    console.log("Successfully connected to MongoDB.");

    // --- Routes ---
    app.get("/", (req, res) => {
      res.status(200).json({ message: "RiskRadar API is healthy" });
    });

    // creating basic transaction api

    app.post("/transaction", async (req, res) => {
      try {
        const { userId, amount } = req.body;

        if (!userId) {
          return res.status(400).json({ message: "userId is required" });
        }

        const key = `rapid_tx:${userId}`;

        // INCREMENT transaction count
        const count = await redisClient.incr(key);

        // If first transaction, set 5 min expiry (300 seconds)
        if (count === 1) {
          await redisClient.expire(key, 300);
        }

        // Risk Logic
        let riskScore = count * 20;
        let status = "SAFE";
        let alert = false;

        if (count >= 3) {
          status = "REVIEW_REQUIRED";
          alert = true;
        }

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
    console.error("Failed to connect to the database:", error);
  }
}

run().catch(console.dir);
