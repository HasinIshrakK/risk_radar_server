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
    const highAmountCollections = db.collection("high_amount");
    

    app.get("/high-amount", async (req, res) => {
      const cursor = highAmountCollections.find();
      const result =  await cursor.toArray();
      res.send(result);
    });


    // ping
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
  }
}

run().catch(console.dir);

// HOME
app.get("/", (req, res) => res.send("Risk-Radar Backend Running!"));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
