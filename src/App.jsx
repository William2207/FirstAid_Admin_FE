import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
// Import các component layout và page
import AdminLayout from "./components/AdminLayout";
import HomePage from "./pages/HomePage";
import { TechniquesManagementTable } from "./components/TechniquesManagementTable";
import { ScenariosManagementTable } from "./components/ScenariosManagementTable";
import { QuizzesManagementTable } from "./components/QuizzesManagementTable";
import { CategoriesManagementTable } from "./components/CategoriesManagementTable";
import LoginPage from "./pages/LoginPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { PracticalCourseManagementTable } from "./components/PracticalCourseManagementTable";
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Trang mặc định chuyển hướng sang /auth/login */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />

          {/* Layout Admin - Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />}></Route>
            <Route path="techniques" element={<TechniquesManagementTable />} />
            <Route path="quizzes" element={<QuizzesManagementTable />} />
            <Route path="categories" element={<CategoriesManagementTable />} />
            <Route path="scenarios" element={<ScenariosManagementTable />} />
            <Route path="practical-courses" element={<PracticalCourseManagementTable />} />
          </Route>

          {/* Login */}
          <Route path="/auth/login" element={<LoginPage />} />

          {/* Unauthorized */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
