import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  Layers,
  Grid3x3,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navigationItems = [
  {
    label: "Dashboard",
    to: "/admin",
    icon: BarChart3,
  },
  {
    label: "Kỹ thuật sơ cứu",
    to: "/admin/techniques",
    icon: BookOpen,
  },
  {
    label: "Quiz",
    to: "/admin/quizzes",
    icon: Grid3x3,
  },
  {
    label: "Danh mục",
    to: "/admin/categories",
    icon: Layers,
  },
  {
    label: "Scenario",
    to: "/admin/scenarios",
    icon: Settings,
  },
];

const cn = (...classes) => classes.filter(Boolean).join(" ");

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const pathname = location.pathname;

  const handleLogout = () => {
    // Gọi logout từ AuthContext (sẽ xóa sessionStorage)
    logout();
    navigate("/auth/login");
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col min-h-screen">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-sidebar-primary">
          FirstAid Admin
        </h1>
        <p className="text-sm text-sidebar-foreground/60">Quản lý hệ thống</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.to ||
            (item.to !== "/admin" && pathname.startsWith(item.to + "/"));

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/20"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer - Nút Đăng xuất */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
