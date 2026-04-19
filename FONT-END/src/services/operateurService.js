import { api, getErrorMessage } from "./api.js";

export async function fetchOperateurAgents() {
  try {
    const { data } = await api.get("/api/users");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function fetchOperateurCamions() {
  try {
    const { data } = await api.get("/api/camions");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
