const express = require("express");
const router = express.Router();
const Visitor = require("../models/Visitor");

// increment visit
router.get("/visit", async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  let data = await Visitor.findOne({ date: today });

  if (!data) {
    data = await Visitor.create({ date: today, count: 1 });
  } else {
    data.count += 1;
    await data.save();
  }

  res.json({ count: data.count });
});

// get today count
router.get("/today", async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const data = await Visitor.findOne({ date: today });

  res.json({ count: data?.count || 0 });
});

module.exports = router;