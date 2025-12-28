import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, Edit2, Plus, ChevronLeft, ChevronRight } from "lucide-react"; // Import icon phân trang
import { CreateScenarioModal } from "./modal/CreateScenarioModal";
import { EditScenarioModal } from "./modal/EditScenarioModal";
import { ConfirmDeleteModal } from "./modal/ConfirmDeleteModal";
import axiosCustom from "@/config/axiosCustom";
import { toast } from "sonner";

export function ScenariosManagementTable() {
  // --- STATE DỮ LIỆU ---
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true); // Thêm trạng thái loading
  const [searchQuery, setSearchQuery] = useState(""); // State tìm kiếm

  // --- STATE PHÂN TRANG ---
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
  });

  // --- STATE MODAL ---
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    scenarioId: null,
    isDeleting: false,
  });

  // Hàm fetch scenarios (Tách ra để tái sử dụng)
  const fetchScenarios = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      // Gọi API kèm tham số phân trang
      const response = await axiosCustom.get(
        `/scenarios?page=${page}&pageSize=${size}`
      );

      // Destructure dữ liệu từ server (Giả định cấu trúc trả về chuẩn như các trang trước)
      const { data, currentPage, totalPages, totalItems, pageSize } =
        response.data;

      setScenarios(data);
      setPagination({
        currentPage: currentPage,
        totalPages: totalPages,
        pageSize: pageSize,
        totalItems: totalItems,
      });
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      toast.error("Không thể tải danh sách scenario.");
    } finally {
      setLoading(false);
    }
  };

  // useEffect gọi API mỗi khi currentPage thay đổi
  useEffect(() => {
    fetchScenarios(pagination.currentPage, pagination.pageSize);
  }, [pagination.currentPage]);

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  // Hàm tạo mới scenario
  const handleCreateScenario = async (data) => {
    try {
      await axiosCustom.post("/scenarios", data);

      // Refresh lại trang hiện tại (hoặc trang 1) sau khi tạo
      fetchScenarios(pagination.currentPage, pagination.pageSize);

      setIsCreateOpen(false);
      toast.success("Tạo scenario thành công!");
    } catch (error) {
      console.error("Error creating scenario:", error);
      toast.error("Lỗi khi tạo scenario. Vui lòng thử lại.");
    }
  };

  // Hàm chỉnh sửa scenario
  const handleEditScenario = async (data) => {
    try {
      await axiosCustom.put(`/scenarios/${editingScenario.id}`, data);

      // Refresh lại dữ liệu trang hiện tại
      fetchScenarios(pagination.currentPage, pagination.pageSize);

      setEditingScenario(null);
      toast.success("Cập nhật scenario thành công!");
    } catch (error) {
      console.error("Error updating scenario:", error);
      toast.error("Lỗi khi cập nhật scenario. Vui lòng thử lại.");
    }
  };

  // Hàm xóa scenario
  const handleDelete = async (id) => {
    try {
      setDeleteConfirm({ ...deleteConfirm, isDeleting: true });
      await axiosCustom.delete(`/scenarios/${id}`);

      toast.success("Xóa scenario thành công!");
      setDeleteConfirm({ isOpen: false, scenarioId: null, isDeleting: false });

      // Logic xử lý khi xóa item cuối cùng của trang
      if (scenarios.length === 1 && pagination.currentPage > 1) {
        setPagination((prev) => ({
          ...prev,
          currentPage: prev.currentPage - 1,
        }));
      } else {
        fetchScenarios(pagination.currentPage, pagination.pageSize);
      }
    } catch (error) {
      console.error("Error deleting scenario:", error);
      toast.error("Lỗi khi xóa scenario. Vui lòng thử lại.");
      setDeleteConfirm({ ...deleteConfirm, isDeleting: false });
    }
  };

  // Hàm mở modal sửa
  const handleOpenEditModal = async (scenario) => {
    // Mở modal ngay lập tức để người dùng biết hệ thống đang phản hồi
    // Bạn có thể thêm loading state riêng cho modal nếu muốn UX tốt hơn
    try {
      const response = await axiosCustom.get(`/scenarios/${scenario.id}`);
      const detailedScenario = response.data;
      setEditingScenario(detailedScenario);
      console.log("Fetched scenario details:", detailedScenario);
    } catch (error) {
      console.error("Error fetching scenario details:", error);
      // Nếu API chi tiết lỗi, fallback về dữ liệu đang có trên bảng
      setEditingScenario(scenario);
      toast.warning(
        "Không thể tải chi tiết đầy đủ, đang hiển thị dữ liệu cơ bản."
      );
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý Scenario
          </h1>
          <p className="text-foreground/60 mt-2">
            Quản lý tất cả tình huống trong hệ thống
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Thêm Scenario
        </Button>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Tìm kiếm scenario..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 border border-border rounded-md bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Scenario</CardTitle>
          <CardDescription>
            Hiển thị{" "}
            {
              scenarios.filter((s) =>
                s.title.toLowerCase().includes(searchQuery.toLowerCase())
              ).length
            }{" "}
            trên tổng số {pagination.totalItems} scenario
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Đang tải dữ liệu...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Tên Scenario
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Loại
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Số bước
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Độ khó
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Trạng thái
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.filter((s) =>
                    s.title.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length > 0 ? (
                    scenarios
                      .filter((s) =>
                        s.title
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((scenario) => (
                        <tr
                          key={scenario.id}
                          className="border-b border-border hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-foreground font-medium">
                            {scenario.title}
                          </td>
                          <td className="py-3 px-4 text-foreground/70 text-sm">
                            {scenario.category === "practice"
                              ? "Thực hành"
                              : "Thử thách"}
                          </td>
                          <td className="py-3 px-4 text-foreground/70">
                            {scenario.stepCount}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                scenario.difficulty === "Easy" ||
                                scenario.difficulty === "Dễ"
                                  ? "bg-green-50 text-green-700"
                                  : scenario.difficulty === "Medium" ||
                                    scenario.difficulty === "Trung Bình"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {scenario.difficulty}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                scenario.isPublished === true
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-gray-50 text-gray-700"
                              }`}
                            >
                              {scenario.isPublished ? "Đã xuất bản" : "Nháp"}
                            </span>
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <Button
                              onClick={() => handleOpenEditModal(scenario)}
                              variant="outline"
                              size="sm"
                              className="gap-1 bg-transparent"
                            >
                              <Edit2 className="w-4 h-4" />
                              Sửa
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-red-600 hover:bg-red-50 bg-transparent"
                              onClick={() =>
                                setDeleteConfirm({
                                  isOpen: true,
                                  scenarioId: scenario.id,
                                  isDeleting: false,
                                })
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                              Xóa
                            </Button>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchQuery
                          ? "Không tìm thấy scenario nào."
                          : "Không có scenario nào."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- PHÂN TRANG (PAGINATION UI) --- */}
      {pagination.totalPages > 0 && !loading && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Trang {pagination.currentPage} / {pagination.totalPages}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Trước
            </Button>

            {/* Logic hiển thị số trang */}
            <div className="inline-flex gap-1 mx-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === pagination.totalPages ||
                    Math.abs(p - pagination.currentPage) <= 1
                )
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && (
                        <span className="mx-1 text-sm">...</span>
                      )}
                      <Button
                        variant={
                          pagination.currentPage === page
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className={`w-8 h-8 p-0 ${
                          pagination.currentPage === page
                            ? "pointer-events-none"
                            : ""
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Sau
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Các Modal */}
      <CreateScenarioModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateScenario}
      />

      {editingScenario && (
        <EditScenarioModal
          isOpen={!!editingScenario}
          onClose={() => setEditingScenario(null)}
          scenario={editingScenario}
          onSubmit={handleEditScenario}
        />
      )}

      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({
            isOpen: false,
            scenarioId: null,
            isDeleting: false,
          })
        }
        onConfirm={() => handleDelete(deleteConfirm.scenarioId)}
        title="Xóa Scenario"
        description="Bạn chắc chắn muốn xóa scenario này không? Hành động này không thể hoàn tác."
        isLoading={deleteConfirm.isDeleting}
      />
    </div>
  );
}
