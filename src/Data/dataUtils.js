const handleTimeData = (data) => {
  const feeds = data.feeds.map((feed) => {
    const createdAt = new Date(feed.created_at);
    const time = createdAt.toTimeString().slice(0, 8);
    const date = createdAt.toISOString().slice(0, 10);

    return {
      ...feed,
      time: time,
      date: date,
    };
  });

  return { feeds: feeds };
};

const getDataField = (data) => {
  const extractedData = data.feeds.map((feed) => ({
    date: feed.date,
    field1: feed.field1,
  }));

  return extractedData;
};

module.exports = { handleTimeData, getDataField };
