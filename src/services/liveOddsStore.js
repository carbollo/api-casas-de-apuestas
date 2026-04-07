const liveOddsByBookmaker = {};

const upsertOdd = ({ bookmakerId, eventId, market, selection, odd }) => {
  if (!bookmakerId || !eventId || !market || !selection || typeof odd !== "number") {
    return false;
  }

  if (!liveOddsByBookmaker[bookmakerId]) {
    liveOddsByBookmaker[bookmakerId] = {};
  }
  if (!liveOddsByBookmaker[bookmakerId][eventId]) {
    liveOddsByBookmaker[bookmakerId][eventId] = {};
  }
  if (!liveOddsByBookmaker[bookmakerId][eventId][market]) {
    liveOddsByBookmaker[bookmakerId][eventId][market] = {};
  }

  liveOddsByBookmaker[bookmakerId][eventId][market][selection] = odd;
  return true;
};

const mergeWithBaseOdds = (baseOddsByBookmaker) => {
  return {
    ...baseOddsByBookmaker,
    ...Object.keys(liveOddsByBookmaker).reduce((acc, bookmakerId) => {
      acc[bookmakerId] = {
        ...(baseOddsByBookmaker[bookmakerId] || {}),
        ...liveOddsByBookmaker[bookmakerId],
      };
      return acc;
    }, {}),
  };
};

const getLiveSnapshot = () => liveOddsByBookmaker;

module.exports = {
  upsertOdd,
  mergeWithBaseOdds,
  getLiveSnapshot,
};
