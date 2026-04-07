const { bookmakers, events, oddsByBookmaker } = require("../data/mockData");
const { mergeWithBaseOdds } = require("./liveOddsStore");

const getAllBookmakers = () => bookmakers;

const getAllEvents = ({ sport, league }) => {
  return events.filter((event) => {
    const sportMatch = sport ? event.sport === sport : true;
    const leagueMatch = league ? event.league.toLowerCase() === league.toLowerCase() : true;
    return sportMatch && leagueMatch;
  });
};

const getEventById = (eventId) => events.find((event) => event.id === eventId);

const getOddsForEvent = (eventId) => {
  const event = getEventById(eventId);
  if (!event) {
    return null;
  }

  const mergedOdds = mergeWithBaseOdds(oddsByBookmaker);

  const byBookmaker = bookmakers.map((bookmaker) => ({
    bookmakerId: bookmaker.id,
    bookmakerName: bookmaker.name,
    odds: mergedOdds[bookmaker.id]?.[eventId] || {},
  }));

  return {
    event,
    byBookmaker,
  };
};

const getBestOddsForEvent = (eventId) => {
  const eventOdds = getOddsForEvent(eventId);
  if (!eventOdds) {
    return null;
  }

  const best = {};

  eventOdds.byBookmaker.forEach(({ bookmakerName, odds }) => {
    Object.entries(odds).forEach(([marketName, marketOdds]) => {
      if (!best[marketName]) {
        best[marketName] = {};
      }

      Object.entries(marketOdds).forEach(([selection, value]) => {
        const existing = best[marketName][selection];
        if (!existing || value > existing.value) {
          best[marketName][selection] = {
            value,
            bookmakerName,
          };
        }
      });
    });
  });

  return {
    event: eventOdds.event,
    bestOdds: best,
  };
};

module.exports = {
  getAllBookmakers,
  getAllEvents,
  getOddsForEvent,
  getBestOddsForEvent,
};
