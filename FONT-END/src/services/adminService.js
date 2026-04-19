import { api, getErrorMessage } from "./api.js";

export async function fetchUtilisateurs() {
  try {
    const { data } = await api.get("/api/utilisateurs");
    return Array.isArray(data) ? data : data?.items ?? [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function fetchSites() {
  try {
    const { data } = await api.get("/api/sites");
    return Array.isArray(data) ? data : data?.items ?? [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createUtilisateur(payload) {
  try {
    const { data } = await api.post("/api/utilisateurs", payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateUtilisateur(id, payload) {
  try {
    const { data } = await api.patch(`/api/utilisateurs/${id}`, payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function removeUtilisateur(id) {
  try {
    await api.delete(`/api/utilisateurs/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createSiteApi(payload) {
  try {
    const { data } = await api.post("/api/sites", payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateSiteApi(id, payload) {
  try {
    const { data } = await api.patch(`/api/sites/${id}`, payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function removeSite(id) {
  try {
    await api.delete(`/api/sites/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function patchUtilisateurSite(userId, siteId) {
  try {
    const { data } = await api.patch(`/api/utilisateurs/${userId}`, { siteId });
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function fetchCamionsAdmin() {
  try {
    const { data } = await api.get("/api/admin/camions");
    return Array.isArray(data) ? data : data?.items ?? [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createCamion(payload) {
  try {
    const { data } = await api.post("/api/admin/camions", payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateCamion(id, payload) {
  try {
    const { data } = await api.patch(`/api/admin/camions/${id}`, payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function removeCamion(id) {
  try {
    await api.delete(`/api/admin/camions/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
