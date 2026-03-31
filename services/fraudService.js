const { redisClient } = require("../config/redis");
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const analyzeRisk = async (transaction) => {
  let riskScore = 0;
  let reasons = [];
  let alert = false;
  let status = "SAFE";

  try {
    const { userId, amount } = transaction;

    const usersCollection = client.db("risk_radar").collection("users");
    const txnCollection = client.db("risk_radar").collection("transactions");

    // Check if user already BLOCKED 
    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });

    if (user?.status === "BLOCKED") {
      return {
        riskScore: 100,
        isSafe: false,
        status: "BLOCKED",
        reasons: "User is blocked",
      };
    }

    //  1. Midnight Rule
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 4) {
      riskScore += 20;
      alert = true;
      reasons.push("Unusual hours (Midnight)");
    }

    //  2. Rapid Transaction (Redis)
    let count = 1;
    if (redisClient && redisClient.isOpen) {
      const key = `rapid_tx:${userId}`;
      count = await redisClient.incr(key);

      if (count === 1) {
        await redisClient.expire(key, 300);
      }

      if (count >= 3) {
        riskScore += 40;
        alert = true;
        reasons.push("Rapid transaction frequency");
      }
    }

    //  3. High Amount
    if (amount > 500) {
      riskScore += 30;
      alert = true;
      reasons.push("High value transaction");
    }

    // Status Decision
    if (riskScore >= 80) {
      status = "HIGH_RISK";
    } else if (riskScore >= 60) {
      status = "REVIEW_REQUIRED";
    }

    // AUTO BLOCK LOGIC
    if (alert) {
      const newFlags = (user?.fraudFlags || 0) + 1;

      let updateData = {
        fraudFlags: newFlags,
      };

      if (newFlags >= 3) {
        updateData.status = "BLOCKED";
      }

      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: updateData }
      );
    }

    // Save Transaction log
    await txnCollection.insertOne({
      userId,
      amount,
      riskScore,
      status,
      alert,
      reason: reasons.join(" | "),
      createdAt: new Date(),
    });

    return {
      riskScore,
      isSafe: riskScore < 60,
      status,
      reasons: reasons.join(" | ") || "None",
    };

  } catch (err) {
    console.error("Fraud Engine Error:", err);

    // Fail-safe
    return {
      riskScore: 0,
      isSafe: true,
      status: "SAFE",
      reasons: "Engine Error",
    };
  }
};

module.exports = { analyzeRisk };