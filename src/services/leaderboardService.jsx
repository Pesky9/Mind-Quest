import axios from "axios";

const API_URL = "https://mind-quest-api.vercel.app/api";

export const leaderboardService = {
  getLeaderboard: async (game) => {
    try {
      const response = await axios.get(`${API_URL}/leaderboard/${game}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      throw error;
    }
  },

  getDetailedLeaderboard: async (game) => {
    try {
      const response = await axios.get(
        `${API_URL}/leaderboard/${game}/detailed`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching detailed leaderboard:", error);
      return leaderboardService.getLeaderboard(game);
    }
  },

  submitScore: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/leaderboard`, data);
      return response.data;
    } catch (error) {
      console.error("Error submitting score:", error);
      throw error;
    }
  },
};
