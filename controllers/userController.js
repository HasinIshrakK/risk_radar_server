const { client } = require('../config/db');
const { ObjectId } = require('mongodb');

const usersCollection = client.db("risk_radar").collection("users")

exports.getUsers = async(req, res) => {
    try {
        const users = await usersCollection.find({}).toArray();
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

exports.getUser = async (request, response) => {
    try {
        const {id} = request.params;
        const user = await usersCollection.findOne({_id: new ObjectId(id)});

        if (!user) return response.status(404).json({message: "User not found"});

        response.status(200).json(user);
    } catch (error) {
        response.status(400).json({error: "Invalid ID format"});
    }
};



exports.createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const result = await usersCollection.insertOne({ 
            name, 
            email, 
            password,
            fraudFlags: 0,   
            status: "ACTIVE",
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
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(id) }, 
            { $set: updates }
        );

        res.status(200).json({ message: `Matched ${result.matchedCount} and updated ${result.modifiedCount} user(s)` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
