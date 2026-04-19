import { api, getErrorMessage } from "./api.js";

export async function fetchCollectes() {
  try {
    const { data } = await api.get("/api/collecte");
    return Array.isArray(data) ? data : data?.items ?? [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function postCollecte(body) {
  try {
    const { data } = await api.post("/api/collecte", body);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function patchCollecte(id, body) {
  try {
    const { data } = await api.patch(`/api/collecte/${id}`, body);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function fetchMissionsAgent(agentId) {
  try {
    const { data } = await api.get(`/api/collecte/missions/${agentId}`);
    return Array.isArray(data) ? data : data?.items ?? [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
