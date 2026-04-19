import { api, getErrorMessage } from "./api.js";

export async function fetchSignalements() {
  try {
    const { data } = await api.get("/api/signalement");
    return Array.isArray(data) ? data : data?.items ?? [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function postSignalement(body, userId) {
  try {
    const { data } = await api.post("/api/signalement", body);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
