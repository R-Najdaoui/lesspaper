import { useState } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  // Initialize token from localStorage safely
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => localStorage.getItem("user"));

  const login = (newToken, username) => {
    setToken(newToken);
    setUser(username);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", username);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
