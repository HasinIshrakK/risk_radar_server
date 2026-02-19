# 🛡️ RiskRadar Server | Fraud Detection Engine
The backend core of the RiskRadar system, powered by Node.js and Redis. This server is responsible for real-time transaction scoring, behavioral analysis, and high-speed data persistence.

# 🚀 Key Technologies
Runtime: Node.js with Express.js
In-Memory Store: Redis (Used for real-time velocity tracking & rate limiting)
Database: MongoDB (Persistent user & transaction logs)

# ⚡ Redis Implementation Logic
The server utilizes Redis to maintain Zero-Latency security checks:
Velocity Tracking: Uses INCR and EXPIRE to count transactions per user within a 60-second window.
Brute Force Protection: Tracks failed login attempts via IP-based keys.
Real-Time Flags: Temporarily caches high-risk scores to trigger immediate Admin alerts via the dashboard.

# 🛠️ Setup & Installation
Clone the repository:
```bash
git clone https://github.com/HasinIshrakK/risk_radar_server/
```

Install dependencies:

```bash
npm install
```

## Environment Variables (.env):
env
PORT=3000
REDIS_URL=redis://localhost:6379

Start the server:
```bash
npm start
```