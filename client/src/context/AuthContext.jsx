import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
const C = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);
  const login = async (data) => {
    const r = await api.post("/auth/login", data);
    localStorage.setItem("token", r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };
  return (
    <C.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </C.Provider>
  );
};
export const useAuth = () => useContext(C);
