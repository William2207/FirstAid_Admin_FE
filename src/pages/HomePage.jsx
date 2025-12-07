import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Grid3x3, Layers, FileText, Loader2 } from "lucide-react";
import axiosCustom from "@/config/axiosCustom";

export default function HomePage() {
  // State để lưu trữ số lượng (mặc định là 0)
  const [dataCounts, setDataCounts] = useState({
    techniques: 0,
    quizzes: 0,
    categories: 0,
    scenarios: 0,
  });

  // State để kiểm tra trạng thái đang tải
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Gọi song song tất cả các API để tiết kiệm thời gian
        const [techRes, quizRes, catRes, scenRes] = await Promise.all([
          axiosCustom.get("/techniques/all"),
          axiosCustom.get("/quiz/all"),
          axiosCustom.get("/techniquetypes/all"),
          axiosCustom.get("/scenarios/all"),
        ]);

        setDataCounts({
          techniques: techRes.data?.length || 0, // Hoặc techRes.data?.total
          quizzes: quizRes.data?.length || 0,
          categories: catRes.data?.length || 0,
          scenarios: scenRes.data?.length || 0,
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu thống kê:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cấu hình hiển thị thống kê dựa trên dữ liệu thật
  const stats = [
    {
      title: "Kỹ thuật sơ cứu",
      value: dataCounts.techniques,
      description: "Tổng số kỹ thuật",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Quiz",
      value: dataCounts.quizzes,
      description: "Tổng số quiz",
      icon: Grid3x3,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Danh mục",
      value: dataCounts.categories,
      description: "Tổng số danh mục",
      icon: Layers,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Scenario",
      value: dataCounts.scenarios,
      description: "Tổng số scenario",
      icon: FileText,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
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
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  ) : (
                    stat.value
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}