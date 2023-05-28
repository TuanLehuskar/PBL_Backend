const axios = require("axios");

const getDataFromAPI = async (apiUrl) => {
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching data from API:", error);
    throw error;
  }
};

module.exports = { getDataFromAPI };
