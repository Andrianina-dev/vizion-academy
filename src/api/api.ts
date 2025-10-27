// src/api.ts
import axios from "axios";

// ✅ Active les cookies/tokens pour toutes les requêtes
axios.defaults.withCredentials = true;

// ✅ Crée une instance Axios centralisée
const api = axios.create({
  baseURL: "https://facts-yet-kijiji-meeting.trycloudflare.com/api",
  withCredentials: true,
});

export default api;
