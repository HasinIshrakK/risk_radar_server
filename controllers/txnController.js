const { redisClient } = require('../config/redis');

exports.analyzeTransaction = async (req, res) => {
    try {
        const { userId, amount } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

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

        if (count >= 3) {
            status = "REVIEW_REQUIRED";
            alert = true;
        }

        res.status(200).json({
            userId,
            transactionCountLast5Min: count,
            riskScore,
            status,
            alert,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
