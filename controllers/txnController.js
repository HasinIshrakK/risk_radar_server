const fraudEngine = require("../services/fraudEngine");
const cacheService = require("../services/cacheService");

exports.analyzeTransaction = async (req, res) => {
  try {
    const { userId, amount, createdAt = new Date() } = req.body;
    
    // 1. Fetch context (Redis)
    const count = await cacheService.getRecentTxCount(userId);

    // 2. Run through Rules Engine
    const { score, reasons, status } = fraudEngine.evaluateRisk({ 
      userId, amount, createdAt, count 
    });

    // 3. Async Logging (Don't make the user wait for DB write if possible)
    const db = getDB();
    await db.collection("transaction").updateOne(
      { userId },
      {
        $set: { lastAmount: amount, riskScore: score, status, reason: reasons, lastUpdated: new Date() },
        $inc: { totalTransaction: 1 },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    res.status(200).json({ userId, score, status, reasons });
  } catch (error) {
    res.status(500).json({ error: "Internal processing error" });
  }
};