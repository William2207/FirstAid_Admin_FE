import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BarChart3, BookOpen, Layers, Grid3x3, Settings } from "lucide-react";

// Dữ liệu cho các mục điều hướng
const navigationItems = [
  {
    label: "Dashboard",
    to: "/", 
    icon: BarChart3,
  },
  {
    label: "Kỹ thuật sơ cứu",
    to: "/techniques", 
    icon: BookOpen,
  },
  {
    label: "Quiz",
    to: "/quizzes", 
    icon: Grid3x3,
  },
  {
    label: "Danh mục",
    to: "/categories", 
    icon: Layers,
  },
  {
    label: "Scenario",
    to: "/scenarios", 
    icon: Settings,
  },
];

// Hàm tiện ích đơn giản để nối class (thay thế cho `cn`)
// Bạn cũng có thể cài đặt thư viện `clsx` để làm việc này tốt hơn
const cn = (...classes) => classes.filter(Boolean).join(" ");

export function AdminSidebar() {
  const location = useLocation(); // Sử dụng useLocation thay cho usePathname
  const pathname = location.pathname;

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
          // Logic kiểm tra active vẫn giữ nguyên nếu bạn muốn kiểm tra cả các route con
          // Ví dụ: /admin/techniques/add cũng sẽ làm active link "Kỹ thuật sơ cứu"
          const isActive =
            pathname === item.to ||
            (item.to !== "/admin" && pathname.startsWith(item.to + "/"));

          return (
            <NavLink
              key={item.to}
              to={item.to} // Sử dụng to thay cho href
              // Thay vì dùng prop `isActive` của NavLink, chúng ta tự tính để khớp với logic cũ
              // của bạn là `startsWith` cho các route con.
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

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <button className="w-full px-4 py-2 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium">
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
