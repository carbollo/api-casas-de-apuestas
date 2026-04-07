const sourceConfigs = [
  // Reemplaza estos valores por endpoints abiertos reales de cada casa.
  // El extractor asume que el payload ya trae: eventId, market, selection, odd.
  // Si el formato es distinto, adapta normalizeFromHttp/normalizeFromWs.
  {
    id: "demo-http-feed",
    bookmakerId: "bet365",
    type: "http",
    url: "https://example.com/open-odds-feed.json",
    method: "GET",
    enabled: false,
  },
  {
    id: "demo-ws-feed",
    bookmakerId: "bwin",
    type: "ws",
    url: "wss://example.com/open-odds-stream",
    enabled: false,
  },
];

module.exports = {
  sourceConfigs,
};
