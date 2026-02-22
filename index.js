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

    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
}

run().catch(console.dir);
