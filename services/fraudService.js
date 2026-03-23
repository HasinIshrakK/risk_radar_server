const { redisClient } = require("../config/redis");

const analyzeRisk = async (transaction) => {
  let riskScore = 0;
  let reasons = [];

  try {
    // 1. Midnight Rule (00:00 - 04:00)
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 4) {
      riskScore += 20;
      reasons.push("Unusual hours (Midnight)");
    }

    // 2. Rapid Transaction Rule (Only runs if Redis is actually ALIVE)
    if (redisClient && redisClient.isOpen) {
      const key = `rapid_tx:${transaction.userId}`;
      const count = await redisClient.incr(key);
      if (count === 1) await redisClient.expire(key, 300);
      
      if (count >= 3) {
        riskScore += 40;
        reasons.push("Rapid transaction frequency");
      }
    }

    // 3. High Amount Rule (Example: > $500)
    if (transaction.amount > 500) {
      riskScore += 30;
      reasons.push("High value transaction");
    }

    return {
      riskScore,
      isSafe: riskScore < 60,
      reasons: reasons.join(" | ") || "None",
    };
  } catch (err) {
    console.error("Fraud Engine Error (Failing Open for Safety):", err);
    // If the fraud engine breaks, we "fail open" so we don't block real money
    return { riskScore: 0, isSafe: true, reasons: "Engine Error" };
  }
};

module.exports = { analyzeRisk };