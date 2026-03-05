const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASS}@cluster0.rwnir9j.mongodb.net/risk_radar`;
const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

// const connectDB = async () => {
//     await client.connect();
//     console.log("✅ MongoDB Connected");
//     return client.db('risk_radar'); 
// };

// module.exports = { connectDB, client };


let db;

const connectDB = async () => {
    await client.connect();
    db = client.db('risk_radar');
    console.log("✅ MongoDB Connected");
};

const getDB = () => db;
// add client in this line
module.exports = { connectDB, getDB ,client};
