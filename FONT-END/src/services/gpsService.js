import { api, getErrorMessage } from "./api.js";

export async function sendPosition(agentId, latitude, longitude) {
  try {
    const { data } = await api.post("/api/gps", { agentId, latitude, longitude });
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
