require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- MongoDB Configuration ---
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@cluster0.w0nmtjl.mongodb.net/?appName=Cluster0`;

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
    const allUsersTransactionCollection = db.collection(
      "all_users_transaction",
    );

    app.get("/users-transaction", async (req, res) => {
      try {
        const usersTransaction = await allUsersTransactionCollection
          .find()
          .toArray();
        res.send(usersTransaction);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch transactions" });
      }
    });

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
