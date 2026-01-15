import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://code-backend-iuol.onrender.com", // adapte si ton backend est sur un autre host/port
  withCredentials: true,
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
