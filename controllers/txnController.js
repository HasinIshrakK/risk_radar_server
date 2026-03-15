const { redisClient } = require("../config/redis");
const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

exports.analyzeTransaction = async (req, res) => {
  try {
    const { userId, amount, createdAt } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ message: "userId and amount required" });
    }

    const db = getDB();
    const transactionCollection = db.collection("transaction");
    const usersCollection = db.collection("users");

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
    let reason = "";

    // Midnight Detection
    const hour = new Date(createdAt).getHours();

    if (hour >= 0 && hour < 4) {
      riskScore += 20;
      alert = true;

      if (reason) {
        reason += " | ";
      }

      reason += "Transaction during midnight hours";
    }

    // Rapid Transaction Rule
    if (count >= 3) {
      alert = true;

      if (reason) {
        reason += " | ";
      }

      reason += "Multiple rapid transaction detected within 5 minutes";
    }

    // Final Risk Decision
    if (riskScore >= 60) {
      status = "REVIEW_REQUIRED";
    }

    // AUTO FLAG + BLOCK LOGIC
    if (alert) {
      const user = await usersCollection.findOne({
        _id: new ObjectId(userId), // important fix
      });

      const currentFlags = user?.fraudFlags || 0;
      const newFlags = currentFlags + 1;

      let updateData = {
        fraudFlags: newFlags,
      };

      if (newFlags >= 3) {
        updateData.status = "BLOCKED";
      }

      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: updateData },
      );
    }

    // MongoDB Save
    // await transactionCollection.updateOne(
    //   { userId },
    //   {
    //     $set: {
    //       lastAmount: amount,
    //       riskScore,
    //       status,
    //       alert,
    //       reason,
    //       lastUpdated: new Date(),
    //     },
    //     $inc: { totalTransaction: 1 },
    //     $setOnInsert: { createdAt: new Date() },
    //   },
    //   { upsert: true },
    // );

    await transactionCollection.insertOne({
      userId,
      amount,
      riskScore,
      status,
      alert,
      reason,
      transactionCountLast5Min: count,
      createdAt: new Date(createdAt),
    });

    res.status(200).json({
      userId,
      transactionCountLast5Min: count,
      riskScore,
      status,
      alert,
      reason,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
