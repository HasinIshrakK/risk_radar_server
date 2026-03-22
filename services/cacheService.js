exports.getRecentTxCount = async (userId) => {
  const key = `rapid_tx:${userId}`;
  const count = await redisClient.incr(key);
  if (count === 1) await redisClient.expire(key, 300);
  return count;
};