import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: apiBase,
  withCredentials: true, // pour envoyer les cookies si backend les utilise
});

// Ajouter le token (si JWT stocké dans localStorage)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gestion globale des erreurs
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[AXIOS RESPONSE ERROR]", err.response || err);
    return Promise.reject(err);
  }
);

export default api;
