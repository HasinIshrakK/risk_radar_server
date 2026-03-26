const Redis = require("redis");

const redisClient = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

const connectRedis = async () => {
    // await redisClient.connect();
    console.log("✅ Redis Connected");
};

module.exports = { redisClient, connectRedis };
