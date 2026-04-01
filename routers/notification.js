const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

// GET notifications by user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // if (!ObjectId.isValid(userId)) {
    //   return res.status(400).send({ error: "Invalid userId" });
    // }

    const collection = client.db("risk_radar").collection("transactions");

    const data = await collection
      .find({
        userId: userId,
        $or: [
          { alert: true },
          { status: { $ne: "SAFE" } }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.send(data);
  } catch (err) {
    console.error("Notification fetch error:", err);
    res.status(500).send({ error: "Failed to fetch notifications" });
  }
});


// PATCH → mark as read
router.patch("/read/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const collection = client.db("risk_radar").collection("transactions");

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { read: true } }
    );

    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ error: "Failed to update" });
  }
});

module.exports = router;