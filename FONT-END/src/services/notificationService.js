import { api, getErrorMessage } from "./api.js";

export async function fetchNotifications(userId) {
  try {
    const { data } = await api.get("/api/notifications", { params: { userId } });
    return Array.isArray(data) ? data : data?.items ?? [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function readNotification(id, userId) {
  try {
    const { data } = await api.patch(`/api/notifications/${id}/lu`, { userId });
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
