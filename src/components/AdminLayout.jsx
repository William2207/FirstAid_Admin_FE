import React from "react";
import { Outlet } from "react-router-dom"; // 1. Import Outlet
import { AdminSidebar } from "./AdminSidebar"; // Đảm bảo đường dẫn đúng
import { Toaster } from "@/components/ui/sonner";
export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-64 flex-1 overflow-auto p-6">
        {" "}
        <Toaster position="top-right" richColors />
        <Outlet /> {/* 2. Thay thế children bằng Outlet */}
      </main>
    </div>
  );
}
