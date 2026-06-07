import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUp, Loader2 } from "lucide-react";
import axiosCustom from "@/config/axiosCustom";

export function RevenueChart() {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const response = await axiosCustom.get(
          `/revenue/monthly/${selectedYear}`
        );

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

        setRevenueData(data);

        const total = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
        setTotalRevenue(total);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu doanh thu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [selectedYear]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <Card className="rounded-2xl border border-[#eaedff] bg-white shadow-[0px_4px_20px_rgba(15,23,42,0.02)]">
      <CardHeader className="space-y-6 pb-6 border-b border-[#f2f3ff]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#131b2e]">
              <TrendingUp className="w-5 h-5 text-[#0058be]" />
              Doanh Thu Theo Tháng
            </CardTitle>
            <CardDescription className="text-[#54647a]">
              Phân tích doanh thu từ bệnh viện và hệ thống học sơ cứu
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-[#131b2e]">Năm:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-[#eaedff] rounded-xl font-medium text-[#131b2e] bg-[#faf8ff] focus:outline-none focus:ring-2 focus:ring-[#0058be] transition-all"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#f2f3ff] rounded-2xl p-5 border border-[#eaedff]">
            <p className="text-sm text-[#505f76] font-semibold mb-1">Tổng doanh thu</p>
            <p className="text-3xl font-bold text-[#131b2e]">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#0058be]" />
              ) : (
                `₫${totalRevenue.toLocaleString("vi-VN")}`
              )}
            </p>
          </div>

          <div className="bg-[#f2f3ff] rounded-2xl p-5 border border-[#eaedff]">
            <p className="text-sm text-[#505f76] font-semibold mb-1">Bình quân tháng</p>
            <p className="text-3xl font-bold text-[#131b2e]">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#0058be]" />
              ) : (
                `₫${(totalRevenue / 12).toLocaleString("vi-VN")}`
              )}
            </p>
          </div>

          <div className="bg-[#f2f3ff] rounded-2xl p-5 border border-[#eaedff]">
            <p className="text-sm text-[#505f76] font-semibold mb-1">
              Số tháng có doanh thu
            </p>
            <p className="text-3xl font-bold text-[#131b2e]">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#0058be]" />
              ) : (
                `${revenueData.filter((d) => d.revenue > 0).length}/12`
              )}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0058be] mb-3" />
              <p className="text-[#54647a] font-medium">Đang tải dữ liệu doanh thu...</p>
            </div>
          </div>
        ) : revenueData.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-[#54647a] font-medium">Không có dữ liệu doanh thu</p>
          </div>
        ) : (
          <div className="space-y-12">
            <div>
              <h4 className="text-base font-semibold text-[#131b2e] mb-6">
                So sánh doanh thu (Khóa học vs Bệnh viện)
              </h4>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eaedff" vertical={false} />
                  <XAxis
                    dataKey="monthName"
                    tick={{ fontSize: 13, fill: "#54647a", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tick={{ fontSize: 13, fill: "#54647a", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                    tickFormatter={(val) => `₫${(val/1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value) => `₫${value.toLocaleString("vi-VN")}`}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #eaedff",
                      borderRadius: "12px",
                      boxShadow: "0px 12px 32px rgba(15,23,42,0.10)",
                      fontWeight: 500,
                      color: "#131b2e"
                    }}
                    cursor={{fill: "#f8fafc"}}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 500, color: "#54647a" }} />
                  <Bar dataKey="courseRevenue" name="Doanh thu Khóa học" fill="#0058be" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="hospitalRevenue" name="Doanh thu Bệnh viện" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="text-base font-semibold text-[#131b2e] mb-6">
                Xu hướng tổng doanh thu
              </h4>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eaedff" vertical={false} />
                  <XAxis
                    dataKey="monthName"
                    tick={{ fontSize: 13, fill: "#54647a", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tick={{ fontSize: 13, fill: "#54647a", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                    tickFormatter={(val) => `₫${(val/1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value) => `₫${value.toLocaleString("vi-VN")}`}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #eaedff",
                      borderRadius: "12px",
                      boxShadow: "0px 12px 32px rgba(15,23,42,0.10)",
                      fontWeight: 500,
                      color: "#131b2e"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0058be"
                    strokeWidth={3}
                    dot={{ fill: "#ffffff", stroke: "#0058be", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: "#0058be", stroke: "#ffffff" }}
                    name="Tổng Doanh thu"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="text-base font-semibold text-[#131b2e] mb-6">
                Chi Tiết Doanh Thu
              </h4>
              <div className="overflow-x-auto rounded-xl border border-[#eaedff]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#eaedff] bg-[#faf8ff]">
                      <th className="text-left py-4 px-5 font-semibold text-[#505f76]">
                        Tháng
                      </th>
                      <th className="text-right py-4 px-5 font-semibold text-[#505f76]">
                        Khóa học
                      </th>
                      <th className="text-right py-4 px-5 font-semibold text-[#505f76]">
                        Bệnh viện
                      </th>
                      <th className="text-right py-4 px-5 font-semibold text-[#505f76]">
                        Tổng cộng
                      </th>
                      <th className="text-right py-4 px-5 font-semibold text-[#505f76]">
                        % Tổng
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.map((item) => (
                      <tr
                        key={item.month}
                        className="border-b border-[#eaedff] last:border-0 hover:bg-[#faf8ff] transition-colors"
                      >
                        <td className="py-4 px-5 font-medium text-[#131b2e]">
                          {item.monthName}
                        </td>
                        <td className="py-4 px-5 text-right text-[#505f76]">
                          ₫{item.courseRevenue.toLocaleString("vi-VN")}
                        </td>
                        <td className="py-4 px-5 text-right text-[#505f76]">
                          ₫{item.hospitalRevenue.toLocaleString("vi-VN")}
                        </td>
                        <td className="py-4 px-5 text-right font-semibold text-[#0058be]">
                          ₫{item.revenue.toLocaleString("vi-VN")}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-[#eef0ff] text-[#004395] text-xs font-bold">
                            {totalRevenue > 0
                              ? ((item.revenue / totalRevenue) * 100).toFixed(1)
                              : 0}
                            %
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
