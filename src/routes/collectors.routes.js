const express = require("express");
const {
  getSources,
  runHttpCollectors,
  runWsCollectors,
  getLiveSnapshot,
} = require("../services/collectorsService");

const router = express.Router();

router.get("/sources", (_req, res) => {
  res.json({ data: getSources() });
});

router.post("/run/http", async (_req, res) => {
  const report = await runHttpCollectors();
  res.json({ data: report });
});

router.post("/run/ws", async (req, res) => {
  const timeoutMs = Number(req.body?.timeoutMs) || 10000;
  const report = await runWsCollectors({ timeoutMs });
  res.json({ data: report });
});

router.get("/snapshot", (_req, res) => {
  res.json({ data: getLiveSnapshot() });
});

module.exports = router;
