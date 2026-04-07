const WebSocket = require("ws");
const { sourceConfigs } = require("../data/sourceConfigs");
const { upsertOdd, getLiveSnapshot } = require("./liveOddsStore");

const getSources = () => sourceConfigs;

const normalizeFromHttp = (bookmakerId, payload) => {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => ({
      bookmakerId,
      eventId: item.eventId,
      market: item.market,
      selection: item.selection,
      odd: Number(item.odd),
    }))
    .filter((entry) => entry.eventId && entry.market && entry.selection && Number.isFinite(entry.odd));
};

const normalizeFromWs = (bookmakerId, payload) => {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const odd = Number(payload.odd);
  if (!payload.eventId || !payload.market || !payload.selection || !Number.isFinite(odd)) {
    return [];
  }

  return [
    {
      bookmakerId,
      eventId: payload.eventId,
      market: payload.market,
      selection: payload.selection,
      odd,
    },
  ];
};

const runHttpCollectors = async () => {
  const httpSources = sourceConfigs.filter((source) => source.enabled && source.type === "http");
  const report = [];

  for (const source of httpSources) {
    try {
      const response = await fetch(source.url, { method: source.method || "GET" });
      if (!response.ok) {
        report.push({ sourceId: source.id, ok: false, reason: `HTTP ${response.status}` });
        continue;
      }

      const json = await response.json();
      const normalized = normalizeFromHttp(source.bookmakerId, json);
      const inserted = normalized.reduce((acc, odd) => (upsertOdd(odd) ? acc + 1 : acc), 0);
      report.push({ sourceId: source.id, ok: true, inserted });
    } catch (error) {
      report.push({ sourceId: source.id, ok: false, reason: error.message });
    }
  }

  return report;
};

const runWsCollectors = async ({ timeoutMs = 10000 } = {}) => {
  const wsSources = sourceConfigs.filter((source) => source.enabled && source.type === "ws");
  const report = [];

  const tasks = wsSources.map(
    (source) =>
      new Promise((resolve) => {
        let inserted = 0;
        const ws = new WebSocket(source.url);

        const timer = setTimeout(() => {
          ws.close();
        }, timeoutMs);

        ws.on("message", (data) => {
          try {
            const payload = JSON.parse(data.toString());
            const normalized = normalizeFromWs(source.bookmakerId, payload);
            inserted += normalized.reduce((acc, odd) => (upsertOdd(odd) ? acc + 1 : acc), 0);
          } catch (_error) {
            // Ignora mensajes no parseables.
          }
        });

        ws.on("close", () => {
          clearTimeout(timer);
          report.push({ sourceId: source.id, ok: true, inserted });
          resolve();
        });

        ws.on("error", (error) => {
          clearTimeout(timer);
          report.push({ sourceId: source.id, ok: false, reason: error.message });
          resolve();
        });
      })
  );

  await Promise.all(tasks);
  return report;
};

module.exports = {
  getSources,
  runHttpCollectors,
  runWsCollectors,
  getLiveSnapshot,
};
