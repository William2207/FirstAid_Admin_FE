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

        // Đảm bảo dữ liệu là mảng
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

        setRevenueData(data);

        // Tính tổng doanh thu
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
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Doanh thu hàng tháng
            </CardTitle>
            <CardDescription>
              Theo dõi doanh thu từng tháng trong năm
            </CardDescription>
          </div>

          {/* Year Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Năm:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-background"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Total Revenue Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                `₫${totalRevenue.toLocaleString("vi-VN")}`
              )}
            </p>
          </div>

          <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <p className="text-sm text-blue-700 font-medium">Bình quân tháng</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                `₫${(totalRevenue / 12).toLocaleString("vi-VN")}`
              )}
            </p>
          </div>

          <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-lg p-4">
            <p className="text-sm text-orange-700 font-medium">
              Số tháng có doanh thu
            </p>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                `${revenueData.filter((d) => d.revenue > 0).length}/12`
              )}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-foreground/60">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : revenueData.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-foreground/60">Không có dữ liệu doanh thu</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Bar Chart */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                Biểu đồ cột
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="monthName"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Tooltip
                    formatter={(value) => `₫${value.toLocaleString("vi-VN")}`}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "4px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                Biểu đồ đường
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="monthName"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Tooltip
                    formatter={(value) => `₫${value.toLocaleString("vi-VN")}`}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "4px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    dot={{ fill: "#10b981", r: 5 }}
                    activeDot={{ r: 7 }}
                    strokeWidth={2}
                    name="Doanh thu"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Data Table */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                Chi tiết doanh thu
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Tháng
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">
                        Doanh thu
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">
                        % Tổng
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.map((item) => (
                      <tr
                        key={item.month}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-medium text-foreground">
                          {item.monthName}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-foreground">
                          ₫{item.revenue.toLocaleString("vi-VN")}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
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
