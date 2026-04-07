const WebSocket = require("ws");
const { listSources } = require("./sourceRegistryService");
const { upsertOdd, getLiveSnapshot } = require("./liveOddsStore");

const getSources = () => listSources();

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

const normalizeFromBetfairMarketBook = (bookmakerId, payload) => {
  if (!Array.isArray(payload)) {
    return [];
  }

  const normalized = [];

  payload.forEach((marketBook) => {
    const eventId = marketBook.marketId;
    const market = marketBook.marketId;
    const runners = Array.isArray(marketBook.runners) ? marketBook.runners : [];

    runners.forEach((runner) => {
      const bestBack = runner?.ex?.availableToBack?.[0]?.price;
      const odd = Number(bestBack);
      if (!eventId || !market || !Number.isFinite(odd)) {
        return;
      }

      normalized.push({
        bookmakerId,
        eventId,
        market,
        selection: String(runner.selectionId || "unknown"),
        odd,
      });
    });
  });

  return normalized;
};

const collectBetfairSource = async (source) => {
  const appKey = process.env.BETFAIR_APP_KEY;
  const sessionToken = process.env.BETFAIR_SESSION_TOKEN;
  const marketIds = Array.isArray(source.marketIds) ? source.marketIds : [];

  if (!appKey || !sessionToken) {
    return { ok: false, reason: "Faltan BETFAIR_APP_KEY o BETFAIR_SESSION_TOKEN" };
  }
  if (marketIds.length === 0) {
    return { ok: false, reason: "BETFAIR_MARKET_IDS vacio (ej: 1.234,1.567)" };
  }

  const body = source.body || {
    marketIds,
    priceProjection: {
      priceData: ["EX_BEST_OFFERS"],
    },
  };

  const response = await fetch(source.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Application": appKey,
      "X-Authentication": sessionToken,
      ...(source.headers || {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return { ok: false, reason: `HTTP ${response.status}` };
  }

  const json = await response.json();
  const normalized = normalizeFromBetfairMarketBook(source.bookmakerId, json);
  const inserted = normalized.reduce((acc, odd) => (upsertOdd(odd) ? acc + 1 : acc), 0);
  return { ok: true, inserted };
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
  const httpSources = listSources().filter((source) => source.enabled && source.type === "http");
  const report = [];

  for (const source of httpSources) {
    try {
      if (source.provider === "betfair") {
        const result = await collectBetfairSource(source);
        report.push({ sourceId: source.id, ...result });
        continue;
      }

      const response = await fetch(source.url, {
        method: source.method || "GET",
        headers: source.headers || undefined,
        body: source.body ? JSON.stringify(source.body) : undefined,
      });
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
  const wsSources = listSources().filter((source) => source.enabled && source.type === "ws");
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
