import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { RevenueChart } from "@/components/RevenueChart";
import axiosCustom from "@/config/axiosCustom";

export default function HomePage() {
  const [dataCounts, setDataCounts] = useState({
    totalPatients: 0,
    totalAppointmentsToday: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        
        const [adminRes, revenueRes] = await Promise.all([
          axiosCustom.get("/statistics/admin-dashboard"),
          axiosCustom.get(`/revenue/year/${currentYear}`),
        ]);

        const adminData = adminRes.data || {};
        const revenueData = revenueRes.data || {};
        
        const monthlyRev = revenueData.monthlyRevenues?.find(m => m.month === currentMonth)?.revenue || 0;

        setDataCounts({
          totalPatients: adminData.totalPatients || 0,
          totalAppointmentsToday: adminData.totalAppointmentsToday || 0,
          monthlyRevenue: monthlyRev,
          yearlyRevenue: revenueData.totalRevenue || 0,
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu thống kê:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: "Tổng Bệnh Nhân",
      value: dataCounts.totalPatients.toLocaleString("vi-VN"),
      description: "Tổng số bệnh nhân",
      icon: Users,
      color: "bg-blue-50 text-[#0058be]",
    },
    {
      title: "Lịch Hẹn Hôm Nay",
      value: dataCounts.totalAppointmentsToday.toLocaleString("vi-VN"),
      description: "Lịch hẹn trong ngày",
      icon: Calendar,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Doanh Thu Tháng Này",
      value: `${dataCounts.monthlyRevenue.toLocaleString("vi-VN")} ₫`,
      description: "Từ mọi nguồn thu",
      icon: DollarSign,
      color: "bg-teal-50 text-teal-600",
    },
    {
      title: "Tổng Doanh Thu Năm",
      value: `${dataCounts.yearlyRevenue.toLocaleString("vi-VN")} ₫`,
      description: `Năm ${new Date().getFullYear()}`,
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const currentDate = new Date();
  const dayName = currentDate.getDay() === 0 ? "Chủ nhật" : `Thứ ${currentDate.getDay() + 1}`;
  const currentDateStr = `${dayName}, ${currentDate.getDate()} tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`;

  return (
    <div className="bg-[#faf8ff] min-h-full p-2 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#131b2e] tracking-tight">Dashboard Quản Trị Bệnh Viện</h1>
        <p className="text-[#505f76] mt-2 font-medium">
          {currentDateStr} • Xin chào, Admin
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="rounded-2xl border border-[#eaedff] bg-white shadow-[0px_4px_20px_rgba(15,23,42,0.02)] hover:shadow-[0px_12px_32px_rgba(15,23,42,0.06)] transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-[#505f76]">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-2 rounded-xl`}>
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#131b2e] tracking-tight">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  ) : (
                    stat.value
                  )}
                </div>
                <p className="text-xs text-[#54647a] mt-1 font-medium">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="mb-8">
        <RevenueChart />
      </div>
    </div>
  );
}
