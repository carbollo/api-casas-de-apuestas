const express = require("express");
const {
  getSources,
  runHttpCollectors,
  runWsCollectors,
  getLiveSnapshot,
} = require("../services/collectorsService");
const {
  createSource,
  updateSource,
  deleteSource,
} = require("../services/sourceRegistryService");

const router = express.Router();

router.get("/sources", (_req, res) => {
  res.json({ data: getSources() });
});

router.post("/sources", (req, res) => {
  const result = createSource(req.body || {});
  if (!result.ok) {
    return res.status(400).json({ error: result.reason });
  }
  return res.status(201).json({ data: result.data });
});

router.patch("/sources/:id", (req, res) => {
  const result = updateSource(req.params.id, req.body || {});
  if (!result.ok) {
    return res.status(400).json({ error: result.reason });
  }
  return res.json({ data: result.data });
});

router.delete("/sources/:id", (req, res) => {
  const result = deleteSource(req.params.id);
  if (!result.ok) {
    return res.status(404).json({ error: result.reason });
  }
  return res.json({ data: result.data });
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
