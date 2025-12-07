import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children, requiredRole = "Admin" }) {
  const { isAuthenticated, hasRole, loading } = useAuth();

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền hạn...</p>
        </div>
      </div>
    );
  }

  // Nếu không xác thực, chuyển đến trang login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Nếu xác thực nhưng không có role cần thiết, chuyển đến trang không có quyền
  if (!hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Nếu tất cả điều kiện được thỏa mãn, render children
  return children;
}
