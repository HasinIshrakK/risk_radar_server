// Each rule is a self-contained logic unit
const rules = [
  {
    name: "Midnight Rule",
    check: (tx) => {
      const hour = new Date(tx.createdAt).getHours();
      return (hour >= 0 && hour < 4) ? { score: 20, reason: "Midnight hours" } : null;
    }
  },
  {
    name: "Rapid Fire Rule",
    check: (tx) => {
      return (tx.count >= 3) ? { score: 30, reason: "High frequency" } : null;
    }
  },
  // Easy to add "High Amount Anomaly" here later!
];

exports.evaluateRisk = (transactionData) => {
  let totalScore = 0;
  let reasons = [];

  rules.forEach(rule => {
    const result = rule.check(transactionData);
    if (result) {
      totalScore += result.score;
      reasons.push(result.reason);
    }
  });

  return {
    score: totalScore,
    reasons: reasons.join(" | "),
    status: totalScore >= 60 ? "REVIEW_REQUIRED" : "SAFE"
  };
};