import { api, getErrorMessage } from "./api.js";

export async function fetchStatistiques() {
  try {
    const { data } = await api.get("/api/statistiques");
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
