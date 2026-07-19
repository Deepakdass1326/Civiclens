import { useState, useCallback, useEffect } from "react";
import { verifyAdminToken } from "../api/admin.api";

const STORAGE_KEY = "civiclens_admin_token";

/**
 * Manages the lightweight admin token used to gate status-change actions
 * on the dashboard. This mirrors the backend's simple shared-secret check
 * (see requireAdmin middleware) — not full user auth, just a way to keep
 * random visitors from flipping complaint statuses.
 */
export function useAdminAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [authStatus, setAuthStatus] = useState("idle");
  const [authError, setAuthError] = useState(null);

  const verify = useCallback(async (candidate) => {
    if (!candidate) return false;
    setAuthStatus("loading");
    setAuthError(null);
    try {
      await verifyAdminToken(candidate);
      localStorage.setItem(STORAGE_KEY, candidate);
      setToken(candidate);
      setAuthStatus("succeeded");
      return true;
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
      setToken("");
      setAuthStatus("failed");
      setAuthError(error.message || "Invalid admin password");
      return false;
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEY);
    if (savedToken) verify(savedToken);
  }, [verify]);

  const login = useCallback((password) => verify(password), [verify]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken("");
    setAuthStatus("idle");
    setAuthError(null);
  }, []);

  return { token, isAdmin: authStatus === "succeeded", authStatus, authError, login, logout };
}
