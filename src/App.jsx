import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
// Import các component layout và page
import AdminLayout from "./components/AdminLayout";
import HomePage from "./pages/HomePage"; // Ví dụ: Trang chủ công khai
import { TechniquesManagementTable } from "./components/TechniquesManagementTable";
import { ScenariosManagementTable } from "./components/ScenariosManagementTable";
import { QuizzesManagementTable } from "./components/QuizzesManagementTable";
import { CategoriesManagementTable } from "./components/CategoriesManagementTable";
import LoginPage from "./pages/LoginPage";
function App() {
  return (
    <Router>
      <Routes>
        {/* Trang mặc định chuyển hướng sang /auth/login */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        {/* Layout Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<HomePage />}></Route>
          <Route path="techniques" element={<TechniquesManagementTable />} />
          <Route path="quizzes" element={<QuizzesManagementTable />} />
          <Route path="categories" element={<CategoriesManagementTable />} />
          <Route path="scenarios" element={<ScenariosManagementTable />} />
        </Route>

        {/* Login */}
        <Route path="/auth/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
