const config = require('./config/env');
config.checkConfig(); // Crash early with a useful error if a key is missing!

const app = require("./app");
const { connectDB } = require("./config/db");
const { connectRedis } = require("./config/redis");

const PORT = process.env.PORT || 3000;

async function run() {
    try {
        await connectDB();
        await connectRedis();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port: ${PORT}`);
        });
    } catch (err) {
        console.error("Startup Error:", err);
        process.exit(1);
    }
}

run();