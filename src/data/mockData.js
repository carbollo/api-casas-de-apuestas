const bookmakers = [
  {
    id: "bet365",
    name: "Bet365",
    country: "UK",
    markets: ["1X2", "over_under", "btts"],
  },
  {
    id: "bwin",
    name: "Bwin",
    country: "Austria",
    markets: ["1X2", "over_under"],
  },
  {
    id: "codere",
    name: "Codere",
    country: "Spain",
    markets: ["1X2", "btts"],
  },
];

const events = [
  {
    id: "ev-001",
    sport: "football",
    league: "LaLiga",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    startsAt: "2026-04-12T19:00:00Z",
  },
  {
    id: "ev-002",
    sport: "football",
    league: "Premier League",
    homeTeam: "Arsenal",
    awayTeam: "Liverpool",
    startsAt: "2026-04-13T16:30:00Z",
  },
];

const oddsByBookmaker = {
  bet365: {
    "ev-001": {
      "1X2": { home: 2.1, draw: 3.5, away: 3.1 },
      over_under: { over2_5: 1.9, under2_5: 1.95 },
      btts: { yes: 1.7, no: 2.1 },
    },
    "ev-002": {
      "1X2": { home: 2.4, draw: 3.4, away: 2.8 },
      over_under: { over2_5: 1.8, under2_5: 2.0 },
      btts: { yes: 1.65, no: 2.2 },
    },
  },
  bwin: {
    "ev-001": {
      "1X2": { home: 2.05, draw: 3.45, away: 3.2 },
      over_under: { over2_5: 1.85, under2_5: 2.02 },
    },
    "ev-002": {
      "1X2": { home: 2.5, draw: 3.35, away: 2.75 },
      over_under: { over2_5: 1.78, under2_5: 2.05 },
    },
  },
  codere: {
    "ev-001": {
      "1X2": { home: 2.15, draw: 3.4, away: 3.05 },
      btts: { yes: 1.72, no: 2.05 },
    },
    "ev-002": {
      "1X2": { home: 2.45, draw: 3.3, away: 2.85 },
      btts: { yes: 1.7, no: 2.12 },
    },
  },
};

module.exports = {
  bookmakers,
  events,
  oddsByBookmaker,
};
