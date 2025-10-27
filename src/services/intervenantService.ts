import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

const API_URLS = `${API_URL}/api/intervenants`;

export const IntervenantService = {
  async getAll() {
    const response = await axios.get(API_URLS);
    return response.data.data; // ← Laravel retourne souvent sous data.data
  }
};
