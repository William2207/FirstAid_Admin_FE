import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import các component layout và page
import AdminLayout from "./components/AdminLayout";
import HomePage from "./pages/HomePage"; // Ví dụ: Trang chủ công khai
import { TechniquesManagementTable } from "./components/TechniquesManagementTable";
import { ScenariosManagementTable } from "./components/ScenariosManagementTable";
import { QuizzesManagementTable } from "./components/QuizzesManagementTable";
import { CategoriesManagementTable } from "./components/CategoriesManagementTable";
function App() {
  return (
    <Router>
      <Routes>
        {/* ===== CÁC ROUTE CÔNG KHAI (KHÔNG CÓ SIDEBAR) ===== */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<HomePage />}></Route>
          <Route
            path="/techniques"
            element={<TechniquesManagementTable />}
          ></Route>
          <Route path="/quizzes" element={<QuizzesManagementTable />}></Route>
          <Route
            path="/categories"
            element={<CategoriesManagementTable />}
          ></Route>
          <Route
            path="/scenarios"
            element={<ScenariosManagementTable />}
          ></Route>
        </Route>

        {/* Có thể thêm route cho trang 404 Not Found ở đây */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
