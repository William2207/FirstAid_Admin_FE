import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Stethoscope, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import axiosCustom from "@/config/axiosCustom";
import { CreateSpecialtyModal } from "./modal/CreateSpecialtyModal";
import { EditSpecialtyModal } from "./modal/EditSpecialtyModal";
import { ConfirmDeleteModal } from "./modal/ConfirmDeleteModal";

const PAGE_SIZE = 10;

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

function StatusBadge({ isActive }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {isActive ? "Hoạt động" : "Ngừng hoạt động"}
    </span>
  );
}

export function SpecialtyManagementTable() {
  const [specialties, setSpecialties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    specialtyId: null,
    isDeleting: false,
  });

  // Debounce search để tránh gọi API mỗi keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSpecialties = useCallback(async (page = 1, search = "") => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ page, pageSize: PAGE_SIZE });
      if (search.trim()) params.append("search", search.trim());

      const response = await axiosCustom.get(`/specialties?${params}`);
      const { data, currentPage, totalPages, totalItems } = response.data;

      setSpecialties(data);
      setPagination({ currentPage, totalPages, totalItems });
    } catch (error) {
      console.error("Lỗi lấy danh sách chuyên khoa:", error);
      toast.error("Không thể tải danh sách chuyên khoa.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    fetchSpecialties(1, debouncedSearch);
  }, [debouncedSearch, fetchSpecialties]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchSpecialties(newPage, debouncedSearch);
    }
  };

  const handleCreate = async (payload) => {
    setIsSubmitting(true);
    try {
      await axiosCustom.post("/specialties", payload);
      toast.success("Tạo chuyên khoa thành công!");
      fetchSpecialties(1, debouncedSearch);
    } catch (error) {
      const message = error.response?.data?.message || "Không thể tạo chuyên khoa.";
      toast.error(message);
      throw error; // để modal không tự đóng khi lỗi
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id, payload) => {
    setIsSubmitting(true);
    try {
      await axiosCustom.put(`/specialties/${id}`, payload);
      toast.success("Cập nhật chuyên khoa thành công!");
      fetchSpecialties(pagination.currentPage, debouncedSearch);
    } catch (error) {
      const message = error.response?.data?.message || "Không thể cập nhật chuyên khoa.";
      toast.error(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }));
    try {
      await axiosCustom.delete(`/specialties/${deleteConfirm.specialtyId}`);
      toast.success("Đã vô hiệu hóa chuyên khoa.");
      setDeleteConfirm({ isOpen: false, specialtyId: null, isDeleting: false });

      if (specialties.length === 1 && pagination.currentPage > 1) {
        fetchSpecialties(pagination.currentPage - 1, debouncedSearch);
      } else {
        fetchSpecialties(pagination.currentPage, debouncedSearch);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Không thể xóa chuyên khoa.";
      toast.error(message);
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  return (
    <div className="space-y-4 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Chuyên khoa</h1>
          <p className="text-gray-500 mt-2">
            Quản lý các chuyên khoa khám bệnh trong hệ thống
          </p>
        </div>
        <CreateSpecialtyModal onSubmit={handleCreate} isSubmitting={isSubmitting} />
      </div>

      {/* Thanh tìm kiếm */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Bảng */}
      <div className="border rounded-lg shadow-sm bg-white">
        <div className="p-6 border-b flex items-center gap-3">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Danh sách chuyên khoa</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Tổng cộng: <span className="font-medium text-gray-700">{pagination.totalItems}</span> chuyên khoa
            </p>
          </div>
        </div>

        <div>
          {isLoading ? (
            <div className="flex justify-center items-center py-16 text-gray-400">
              <svg className="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Đang tải dữ liệu...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 w-12">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên chuyên khoa</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Mô tả</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Giá khám</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Số bác sĩ</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {specialties.length > 0 ? (
                    specialties.map((specialty, index) => (
                      <tr
                        key={specialty.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {(pagination.currentPage - 1) * PAGE_SIZE + index + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{specialty.name}</div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500 max-w-xs">
                          <span className="line-clamp-2">{specialty.description || "—"}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-medium text-gray-800">
                            {formatPrice(specialty.price)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
                            {specialty.doctorCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge isActive={specialty.isActive} />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <EditSpecialtyModal
                              specialty={specialty}
                              onSubmit={handleUpdate}
                              isSubmitting={isSubmitting}
                            />
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  isOpen: true,
                                  specialtyId: specialty.id,
                                  isDeleting: false,
                                })
                              }
                              className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        <Stethoscope className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        {debouncedSearch
                          ? `Không tìm thấy chuyên khoa nào khớp với "${debouncedSearch}".`
                          : "Chưa có chuyên khoa nào."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Phân trang */}
      {pagination.totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-end gap-2 py-2">
          <span className="text-sm text-gray-500 mr-auto">
            Trang {pagination.currentPage} / {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 ||
                p === pagination.totalPages ||
                Math.abs(p - pagination.currentPage) <= 1
            )
            .map((page, idx, arr) => (
              <React.Fragment key={page}>
                {idx > 0 && arr[idx - 1] !== page - 1 && (
                  <span className="text-gray-400 text-sm px-1">…</span>
                )}
                <button
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-md border text-sm font-medium transition-colors ${
                    page === pagination.currentPage
                      ? "bg-blue-600 text-white border-blue-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            ))}

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirm delete modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, specialtyId: null, isDeleting: false })}
        onConfirm={handleDelete}
        title="Vô hiệu hóa chuyên khoa"
        description="Chuyên khoa sẽ bị đặt về trạng thái ngừng hoạt động. Bạn có thể kích hoạt lại sau. Bạn có chắc muốn thực hiện?"
        isLoading={deleteConfirm.isDeleting}
      />
    </div>
  );
}
