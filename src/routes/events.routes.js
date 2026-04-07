const express = require("express");
const { getAllEvents } = require("../services/oddsService");

const router = express.Router();

router.get("/", (req, res) => {
  const { sport, league } = req.query;
  const data = getAllEvents({ sport, league });

  res.json({ data });
});

module.exports = router;
