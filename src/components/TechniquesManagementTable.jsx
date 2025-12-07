import React, { useState, useEffect } from "react";
import { CreateTechniqueModal } from "./modal/CreateTechniqueModal";
import { EditTechniqueModal } from "./modal/EditTechniqueModal";
import { ConfirmDeleteModal } from "./modal/ConfirmDeleteModal";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Import icon phân trang
import axiosCustom from "@/config/axiosCustom";
import { toast } from "sonner";

export function TechniquesManagementTable() {
  // --- STATE DỮ LIỆU ---
  const [techniques, setTechniques] = useState([]);
  const [loading, setLoading] = useState(true); // State loading cho bảng
  
  // --- STATE PHÂN TRANG ---
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10, // Số lượng item trên mỗi trang
    totalPages: 1,
    totalItems: 0,
  });

  // --- STATE MODAL ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTechnique, setCurrentTechnique] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    techniqueId: null,
    isDeleting: false,
  });

  // Hàm gọi API lấy danh sách kỹ thuật (Tách ra để tái sử dụng)
  const fetchTechniques = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      // Gọi API với tham số phân trang
      const response = await axiosCustom.get(`/techniques?page=${page}&pageSize=${size}`);
      
      // Destructure dữ liệu trả về từ server
      const { data, currentPage, totalPages, totalItems, pageSize } = response.data;
      
      setTechniques(data);
      setPagination({
        currentPage: currentPage,
        totalPages: totalPages,
        pageSize: pageSize,
        totalItems: totalItems,
      });
    } catch (error) {
      console.error("Không thể tải danh sách kỹ thuật:", error);
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // useEffect gọi API khi currentPage thay đổi
  useEffect(() => {
    fetchTechniques(pagination.currentPage, pagination.pageSize);
  }, [pagination.currentPage]);

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeleteConfirm({ ...deleteConfirm, isDeleting: true });
      await axiosCustom.delete(`/techniques/${id}`);
      
      toast.success("Xóa kỹ thuật thành công!");
      setDeleteConfirm({ isOpen: false, techniqueId: null, isDeleting: false });

      // Logic xử lý khi xóa item cuối cùng của trang
      if (techniques.length === 1 && pagination.currentPage > 1) {
         // Lùi về trang trước
         setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
      } else {
         // Reload trang hiện tại
         fetchTechniques(pagination.currentPage, pagination.pageSize);
      }
    } catch (error) {
      console.error("Lỗi khi xóa kỹ thuật:", error);
      toast.error("Xóa kỹ thuật thất bại, vui lòng thử lại.");
      setDeleteConfirm({ ...deleteConfirm, isDeleting: false });
    }
  };

  /**
   * Hàm trợ giúp để upload một file lên API Cloudinary của bạn.
   */
  const uploadFile = async (file) => {
    if (!file) return null;
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const response = await axiosCustom.post("/media/upload", uploadFormData);
      return response.data.url;
    } catch (error) {
      console.error("Lỗi khi upload file:", error);
      throw new Error(`Upload file ${file.name} thất bại.`);
    }
  };

  /**
   * Hàm xử lý việc thêm kỹ thuật mới
   */
  const handleAddTechnique = async (formData) => {
    setIsSubmitting(true);
    console.log("Dữ liệu gửi lên API:", formData);

    try {
      console.log("Bắt đầu quá trình upload file...");
      const uploadPromises = [];

      if (formData.videoFile) uploadPromises.push(uploadFile(formData.videoFile));
      if (formData.imageFile) uploadPromises.push(uploadFile(formData.imageFile));

      formData.steps.forEach((step) => {
        if (step.imageFile) {
          uploadPromises.push(uploadFile(step.imageFile));
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      console.log("Tất cả các file đã được upload:", uploadedUrls);

      const payload = { ...formData };
      let urlIndex = 0;

      if (payload.videoFile) {
        payload.videoUrl = uploadedUrls[urlIndex++];
        delete payload.videoFile;
      }
      if (payload.imageFile) {
        payload.imageUrl = uploadedUrls[urlIndex++];
        delete payload.imageFile;
      }

      payload.steps = payload.steps.map((step) => {
        if (step.imageFile) {
          const newStep = { ...step, imageUrl: uploadedUrls[urlIndex++] };
          delete newStep.imageFile;
          return newStep;
        }
        const newStep = { ...step, imageUrl: null };
        delete newStep.imageFile;
        return newStep;
      });

      // Gửi payload đến API
      await axiosCustom.post("/techniques", payload);
      
      // Refresh dữ liệu trang hiện tại
      fetchTechniques(pagination.currentPage, pagination.pageSize);
      
      setShowAddModal(false);
      toast.success("Tạo kỹ thuật thành công!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi tạo kỹ thuật mới.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = async (technique) => {
    setIsLoadingDetail(true);
    try {
      const response = await axiosCustom.get(`/techniques/${technique.id}`);
      setCurrentTechnique(response.data);
      setShowEditModal(true);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết kỹ thuật:", error);
      toast.error("Không thể tải thông tin kỹ thuật.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCurrentTechnique(null);
  };

  const handleUpdateTechnique = async (formData) => {
    if (!currentTechnique) return;
    setIsSubmitting(true);
    try {
      await axiosCustom.put(`/techniques/${currentTechnique.id}`, formData);

      // Cập nhật lại danh sách trang hiện tại
      fetchTechniques(pagination.currentPage, pagination.pageSize);

      toast.success("Cập nhật kỹ thuật thành công!");
      handleCloseEditModal();
    } catch (error) {
      console.error("Lỗi khi cập nhật kỹ thuật:", error);
      toast.error("Cập nhật kỹ thuật thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Quản lý kỹ thuật sơ cứu
          </h1>
          <p className="text-gray-500 mt-2">
            Quản lý toàn bộ kỹ thuật sơ cứu trong hệ thống
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Thêm kỹ thuật
        </button>
      </div>

      <div className="border rounded-lg shadow-sm bg-white">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Danh sách kỹ thuật</h2>
          <p className="text-gray-600">
            Hiển thị {techniques.length} trên tổng số {pagination.totalItems} kỹ thuật
          </p>
        </div>
        <div className="p-0">
          {loading ? (
             <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Tên kỹ thuật
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Danh mục
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Độ khó
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {techniques.length > 0 ? (
                  techniques.map((technique) => (
                    <tr key={technique.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium">{technique.title}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {technique.type?.name || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            technique.difficulty === "Easy" || technique.difficulty === "Dễ"
                              ? "bg-green-100 text-green-800"
                              : technique.difficulty === "Medium" || technique.difficulty === "Trung Bình"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {technique.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button
                          onClick={() => handleOpenEditModal(technique)}
                          disabled={isLoadingDetail}
                          className="flex items-center gap-1 px-3 py-1 border rounded-md hover:bg-gray-100 transition-colors"
                        >
                          {isLoadingDetail && currentTechnique?.id === technique.id ? "..." : "Sửa"}
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              isOpen: true,
                              techniqueId: technique.id,
                              isDeleting: false,
                            })
                          }
                          className="flex items-center gap-1 px-3 py-1 border rounded-md text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                   <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">Không có kỹ thuật nào.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      {/* --- PHẦN UI PHÂN TRANG --- */}
      {pagination.totalPages > 0 && !loading && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-gray-500">
            Trang {pagination.currentPage} / {pagination.totalPages}
          </div>
          <div className="space-x-2 flex items-center">
            <button
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Trước
            </button>
            
            {/* Logic hiển thị số trang */}
            <div className="hidden sm:flex space-x-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.currentPage) <= 1)
                  .map((page, index, array) => {
                      const showEllipsis = index > 0 && page - array[index - 1] > 1;
                      return (
                        <div key={page} className="flex items-center">
                           {showEllipsis && <span className="mx-1 text-gray-400">...</span>}
                           <button
                              className={`w-8 h-8 flex items-center justify-center rounded border ${
                                pagination.currentPage === page 
                                ? "bg-blue-600 text-white border-blue-600" 
                                : "bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                              onClick={() => handlePageChange(page)}
                           >
                              {page}
                           </button>
                        </div>
                      );
                  })
                }
            </div>

            <button
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Sau
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Components */}
      {showAddModal && (
        <CreateTechniqueModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddTechnique}
          isSubmitting={isSubmitting}
        />
      )}

      {showEditModal && currentTechnique && (
        <EditTechniqueModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSubmit={handleUpdateTechnique}
          techniqueData={currentTechnique}
        />
      )}

      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({
            isOpen: false,
            techniqueId: null,
            isDeleting: false,
          })
        }
        onConfirm={() => handleDelete(deleteConfirm.techniqueId)}
        title="Xóa Kỹ Thuật"
        description="Bạn chắc chắn muốn xóa kỹ thuật này không? Hành động này không thể hoàn tác."
        isLoading={deleteConfirm.isDeleting}
      />
    </div>
  );
}