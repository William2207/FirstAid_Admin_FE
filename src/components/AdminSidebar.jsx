import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  Layers,
  Grid3x3,
  Settings,
  LogOut,
  Activity,
  Users,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const firstAidItems = [
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
    label: "Bài tập tình huống",
    to: "/admin/scenarios",
    icon: Settings,
  },
  {
    label: "Khóa học thực hành",
    to: "/admin/practical-courses",
    icon: Activity,
  },
];

const hospitalItems = [
  {
    label: "Quản lý nhân viên y tế",
    to: "/admin/staff",
    icon: Users,
  },
  {
    label: "Quản lý Chuyên khoa",
    to: "/admin/specialties",
    icon: Stethoscope,
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

  const renderNavLinks = (items) => {
    return items.map((item) => {
      const Icon = item.icon;
      const isActive =
        pathname === item.to ||
        (item.to !== "/admin" && pathname.startsWith(item.to + "/"));

      return (
        <NavLink
          key={item.to}
          to={item.to}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1",
            isActive
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/20"
          )}
        >
          <Icon className="w-5 h-5" />
          <span className="font-medium">{item.label}</span>
        </NavLink>
      );
    });
  };

  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-40">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border shrink-0">
        <h1 className="text-2xl font-bold text-sidebar-primary">
          FirstAid Admin
        </h1>
        <p className="text-sm text-sidebar-foreground/60">Quản lý hệ thống</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Dashboard Link (Standalone) */}
        <div>
          {renderNavLinks([
            {
              label: "Dashboard",
              to: "/admin",
              icon: BarChart3,
            },
          ])}
        </div>

        <div>
          <h3 className="px-4 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
            Nội dung học sơ cứu
          </h3>
          {renderNavLinks(firstAidItems)}
        </div>

        <div>
          <h3 className="px-4 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
            Hệ thống bệnh viện
          </h3>
          {renderNavLinks(hospitalItems)}
        </div>
      </nav>

      {/* Footer - Nút Đăng xuất */}
      <div className="p-4 border-t border-sidebar-border shrink-0">
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
