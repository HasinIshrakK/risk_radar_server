const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASS}@cluster0.rwnir9j.mongodb.net/risk_radar`;
const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

const connectDB = async () => {
    await client.connect();
    console.log("✅ MongoDB Connected");
    return client.db('risk_radar'); 
};

module.exports = { connectDB, client };