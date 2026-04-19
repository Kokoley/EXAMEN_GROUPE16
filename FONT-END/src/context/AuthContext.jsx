import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { getDashboardPath } from "../constants/roles.js";
import { loginRequest } from "../services/authService.js";

const AuthContext = createContext(null);

const STORAGE_TOKEN = "token";
const STORAGE_USER = "user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    try {
      const t = localStorage.getItem(STORAGE_TOKEN);
      const u = localStorage.getItem(STORAGE_USER);
      if (t && u) {
        setToken(t);
        setUser(JSON.parse(u));
      }
    } catch {
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_USER);
    } finally {
      setBootstrapping(false);
    }
  }, []);

  const persistSession = useCallback((t, u) => {
    setToken(t);
    setUser(u);
    localStorage.setItem(STORAGE_TOKEN, t);
    localStorage.setItem(STORAGE_USER, JSON.stringify(u));
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await loginRequest(email, password);
      persistSession(data.token, data.user);
      return getDashboardPath(data.user.role);
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      bootstrapping,
      isAuthenticated: Boolean(token && user),
      login,
      logout
    }),
    [user, token, bootstrapping, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
