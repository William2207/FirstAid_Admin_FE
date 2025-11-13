import React, { useState } from "react";

// Lưu ý: Các className trong file này được viết theo cú pháp của Tailwind CSS.
// Bạn cần cài đặt và cấu hình Tailwind CSS trong dự án React của mình để chúng có hiệu lực.
// Nếu không, bạn có thể thay thế chúng bằng file CSS của riêng bạn.

/**
 * Dữ liệu mẫu cho danh sách các tình huống (scenarios).
 * Trong JavaScript, chúng ta không dùng interface, nhưng mỗi đối tượng trong mảng này
 * nên có cấu trúc như sau:
 * {
 *   id: string,
 *   title: string,
 *   category: string,
 *   steps: number,
 *   difficulty: string,
 *   status: string,
 *   createdAt: string,
 * }
 */
const mockScenarios = [
  {
    id: "1",
    title: "Trường hợp bệnh nhân co giật",
    category: "Tim mạch",
    steps: 5,
    difficulty: "Khó",
    status: "Đã xuất bản",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Xử lý vết thương sâu",
    category: "Ngoài da",
    steps: 4,
    difficulty: "Trung bình",
    status: "Đã xuất bản",
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    title: "Bệnh nhân không thể hô hấp",
    category: "Hô hấp",
    steps: 6,
    difficulty: "Khó",
    status: "Nháp",
    createdAt: "2024-01-13",
  },
  {
    id: "4",
    title: "Chảy máu do chấn thương",
    category: "Chấn thương",
    steps: 3,
    difficulty: "Dễ",
    status: "Đã xuất bản",
    createdAt: "2024-01-12",
  },
  {
    id: "5",
    title: "Bệnh nhân bất tỉnh",
    category: "Tình huống khẩn cấp",
    steps: 7,
    difficulty: "Khó",
    status: "Đã xuất bản",
    createdAt: "2024-01-11",
  },
];

export function ScenariosManagementTable() {
  const [scenarios, setScenarios] = useState(mockScenarios);

  // Loại bỏ chú thích kiểu `: string` khỏi tham số `id`
  const handleDelete = (id) => {
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Scenario</h1>
          <p className="text-gray-500 mt-2">
            Quản lý tất cả tình huống trong hệ thống
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Thêm Scenario
        </button>
      </div>

      <div className="border rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold">Danh sách Scenario</h2>
          <p className="text-gray-600">Tổng cộng {scenarios.length} scenario</p>
        </div>
        <div className="p-6 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Tên Scenario
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Danh mục
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Số bước
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Độ khó
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Trạng thái
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Ngày tạo
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((scenario) => (
                  <tr
                    key={scenario.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-800 font-medium">
                      {scenario.title}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {scenario.category}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {scenario.steps}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          scenario.difficulty === "Dễ"
                            ? "bg-green-100 text-green-800"
                            : scenario.difficulty === "Trung bình"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {scenario.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          scenario.status === "Đã xuất bản"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {scenario.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {scenario.createdAt}
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button className="flex items-center gap-1 px-3 py-1 border rounded-md hover:bg-gray-100">
                        Sửa
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-1 border rounded-md text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(scenario.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
