import { api, getErrorMessage } from "./api.js";

export async function loginRequest(email, password) {
  try {
    const { data } = await api.post("/api/login", { email, password });
    if (!data?.token || !data?.user) {
      throw new Error("Réponse serveur invalide.");
    }
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Connexion impossible."));
  }
}
