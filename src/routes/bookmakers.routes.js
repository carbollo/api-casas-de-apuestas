const express = require("express");
const { getAllBookmakers } = require("../services/oddsService");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    data: getAllBookmakers(),
  });
});

module.exports = router;
