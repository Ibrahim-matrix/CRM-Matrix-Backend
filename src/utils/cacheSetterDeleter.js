const setCache = async (redisClient, originalUrl, data) => {
  try {
    return await redisClient.set(originalUrl, data);
  } catch (error) {
  }
};

const deleteCache = async (redisClient,url) => {
  try {
    const deletedData =  await redisClient.del(url);
  } catch (error) {
  }
};

module.exports = {
  setCache,
  deleteCache,
};
