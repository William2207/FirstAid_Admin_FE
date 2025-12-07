import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Khởi tạo từ sessionStorage khi component mount
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const storedRoles = sessionStorage.getItem("roles");
    const storedUser = sessionStorage.getItem("user");

    if (token && storedRoles && storedUser) {
      setRoles(JSON.parse(storedRoles));
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, userRoles, token) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("roles", JSON.stringify(userRoles));
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setRoles(userRoles);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("roles");
    sessionStorage.removeItem("user");
    setUser(null);
    setRoles([]);
  };

  const hasRole = (requiredRole) => {
    if (!roles) return false;

    // Nếu roles là mảng
    if (Array.isArray(roles)) {
      return roles.includes(requiredRole);
    }

    // Nếu roles là chuỗi
    if (typeof roles === "string") {
      return roles === requiredRole;
    }

    return false;
  };

  const isAuthenticated = !!user && !!sessionStorage.getItem("token");

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        loading,
        login,
        logout,
        hasRole,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
