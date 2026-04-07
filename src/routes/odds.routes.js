const express = require("express");
const { getOddsForEvent, getBestOddsForEvent } = require("../services/oddsService");

const router = express.Router();

router.get("/:eventId", (req, res) => {
  const { eventId } = req.params;
  const odds = getOddsForEvent(eventId);

  if (!odds) {
    return res.status(404).json({
      error: "Evento no encontrado",
    });
  }

  return res.json({
    data: odds,
  });
});

router.get("/:eventId/best", (req, res) => {
  const { eventId } = req.params;
  const best = getBestOddsForEvent(eventId);

  if (!best) {
    return res.status(404).json({
      error: "Evento no encontrado",
    });
  }

  return res.json({
    data: best,
  });
});

module.exports = router;
