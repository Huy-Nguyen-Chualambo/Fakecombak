import axios from 'axios';

const API_URL = 'http://localhost:8080';

export const fetchTrendingCoins = async () => {
  try {
    const response = await axios.get(`${API_URL}/coins/trending`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trending coins:', error);
    throw error;
  }
};

export const fetchTopCoins = async () => {
  try {
    const response = await axios.get(`${API_URL}/coins/top50`);
    return response.data;
  } catch (error) {
    console.error('Error fetching top coins:', error);
    throw error;
  }
};

export const fetchCoinDetails = async (coinId: string) => {
  try {
    const response = await axios.get(`${API_URL}/coins/details/${coinId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for coin ${coinId}:`, error);
    throw error;
  }
};

export const fetchMarketChart = async (coinId: string, days: number) => {
  try {
    const response = await axios.get(`${API_URL}/coins/${coinId}/chart?days=${days}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching market chart for coin ${coinId}:`, error);
    throw error;
  }
};

export const searchCoin = async (keyword: string) => {
  try {
    const response = await axios.get(`${API_URL}/coins/search?q=${keyword}`);
    return response.data;
  } catch (error) {
    console.error('Error searching coins:', error);
    throw error;
  }
};