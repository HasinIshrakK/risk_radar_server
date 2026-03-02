const { client } = require('../config/db'); 

exports.createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const collection = client.db("risk_radar").collection("users");

        const result = await collection.insertOne({ 
            name, 
            email, 
            password,
            createdAt: new Date() 
        });

        res.status(201).json({ 
            message: "User created in MongoDB ✅", 
            userId: result.insertedId 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const { ObjectId } = require('mongodb');

        const collection = client.db("risk_radar").collection("users");

        const result = await collection.updateOne(
            { _id: new ObjectId(id) }, 
            { $set: updates }
        );

        res.status(200).json({ message: `Matched ${result.matchedCount} and updated ${result.modifiedCount} user(s)` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
