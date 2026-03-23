require('dotenv').config({ 
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local' 
});

module.exports = {
  PORT: process.env.PORT || 3000,
  STRIPE_SECRET: process.env.STRIPE_SECRET,
  SITE_DOMAIN: process.env.SITE_DOMAIN,
  MONGO_URI: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASS}@cluster0.rwnir9j.mongodb.net/risk_radar`,
  // Add a helper to check if things are missing
  checkConfig: () => {
    const required = ['STRIPE_SECRET', 'SITE_DOMAIN'];
    required.forEach(key => {
      if (!process.env[key]) throw new Error(`MISSING ENV VAR: ${key}`);
    });
  }
};