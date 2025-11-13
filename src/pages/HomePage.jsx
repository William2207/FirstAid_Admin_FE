import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Đảm bảo đường dẫn này đúng trong cấu trúc dự án của bạn
import { BookOpen, Grid3x3, Layers, FileText } from "lucide-react";

// Dữ liệu thống kê (giữ nguyên)
const stats = [
  {
    title: "Kỹ thuật sơ cứu",
    value: "24",
    description: "Tổng số kỹ thuật",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Quiz",
    value: "12",
    description: "Tổng số quiz",
    icon: Grid3x3,
    color: "bg-green-50 text-green-600",
  },
  {
    title: "Danh mục",
    value: "8",
    description: "Tổng số danh mục",
    icon: Layers,
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Scenario",
    value: "16",
    description: "Tổng số scenario",
    icon: FileText,
    color: "bg-orange-50 text-orange-600",
  },
];

// Component AdminDashboard
export default function HomePage() {
  // Toàn bộ phần JSX được giữ nguyên vì nó tương thích hoàn toàn với React
  return (
    // Xóa class p-8 ở đây vì chúng ta đã thêm padding trong AdminLayout
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-foreground/60 mt-2">
          Chào mừng đến bảng điều khiển quản trị
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>Các thay đổi được thực hiện gần đây</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Thêm kỹ thuật CPR</p>
                <p className="text-sm text-muted-foreground">2 giờ trước</p>
              </div>
              <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                Hoàn tất
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Cập nhật Quiz Sơ cứu</p>
                <p className="text-sm text-muted-foreground">5 giờ trước</p>
              </div>
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                Cập nhật
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Thêm Scenario chăm sóc vết thương</p>
                <p className="text-sm text-muted-foreground">1 ngày trước</p>
              </div>
              <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                Hoàn tất
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
