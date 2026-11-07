import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
const C = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    // Check both storages (rememberMe uses localStorage, otherwise sessionStorage)
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);
  const login = async (data, rememberMe = false) => {
    const r = await api.post("/auth/login", data);
    // Store in localStorage (persistent) or sessionStorage (session-only)
    const storage = rememberMe ? localStorage : sessionStorage;
    // Clear both first to avoid stale tokens
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    storage.setItem("token", r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };
  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUser(null);
  };
  return (
    <C.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </C.Provider>
  );
};
export const useAuth = () => useContext(C);
