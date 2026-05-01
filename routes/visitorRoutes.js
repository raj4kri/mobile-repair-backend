const express = require("express");
const router = express.Router();
const Visitor = require("../models/Visitors");

// helper: get IST date safely
const getToday = () => {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  ist.setHours(0, 0, 0, 0);
  return ist;
};

// increment visit
router.get("/visit", async (req, res) => {
  try {
    const today = getToday();

    const data = await Visitor.findOneAndUpdate(
      { date: today },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    res.json({ count: data.count });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// get today count
router.get("/today", async (req, res) => {
  try {
    const today = getToday();

    const data = await Visitor.findOne({ date: today });

    res.json({ count: data?.count || 0 });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;