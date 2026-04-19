import axios from "axios";

const rawBase =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

/** Base URL : vide = même origine (proxy Vite /api → backend) */
export const api = axios.create({
  baseURL: rawBase || "",
  headers: { "Content-Type": "application/json" },
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getErrorMessage = (error, fallback = "Une erreur est survenue.") => {
  const data = error.response?.data;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;
  if (error.message) return error.message;
  return fallback;
};
