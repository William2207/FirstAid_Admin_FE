import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react"; // Import icon phân trang
import { CreateCategoryModal } from "./modal/CreateCategoryModal";
import { EditCategoryModal } from "./modal/EditCategoryModal";
import { ConfirmDeleteModal } from "./modal/ConfirmDeleteModal";
import axiosCustom from "@/config/axiosCustom";
import { toast } from "sonner";

export function CategoriesManagementTable() {
  // --- STATE DỮ LIỆU ---
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // Thêm trạng thái loading

  // --- STATE PHÂN TRANG ---
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
  });

  // --- STATE MODAL ---
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    categoryId: null,
    isDeleting: false,
  });

  // Hàm gọi API lấy danh sách danh mục (Tách ra để tái sử dụng)
  const fetchCategories = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      // Gọi API kèm tham số phân trang
      const response = await axiosCustom.get(
        `/techniquetypes?page=${page}&pageSize=${size}`
      );
      
      // Giả định server trả về cấu trúc chuẩn phân trang
      // Nếu server trả về khác, bạn cần map lại các biến này
      const { data, currentPage, totalPages, totalItems, pageSize } = response.data;

      setCategories(data);
      setPagination({
        currentPage: currentPage,
        totalPages: totalPages,
        pageSize: pageSize,
        totalItems: totalItems,
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  // useEffect gọi API mỗi khi currentPage thay đổi
  useEffect(() => {
    fetchCategories(pagination.currentPage, pagination.pageSize);
  }, [pagination.currentPage]);

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  // Xóa một danh mục
  const handleDelete = async (id) => {
    try {
      setDeleteConfirm({ ...deleteConfirm, isDeleting: true });
      await axiosCustom.delete(`/techniquetypes/${id}`);

      toast.success("Đã xóa danh mục thành công.");
      setDeleteConfirm({ isOpen: false, categoryId: null, isDeleting: false });

      // Logic xử lý khi xóa item cuối cùng của trang
      if (categories.length === 1 && pagination.currentPage > 1) {
        // Lùi về trang trước đó
        setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
      } else {
        // Tải lại trang hiện tại
        fetchCategories(pagination.currentPage, pagination.pageSize);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      let errorMessage = "Không thể xóa danh mục. Vui lòng thử lại.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response?.data === "string") {
        errorMessage = error.response.data;
      }

      toast.error("Thao tác thất bại", {
        description: errorMessage,
      });
      setDeleteConfirm({ ...deleteConfirm, isDeleting: false });
    }
  };

  // Thêm một danh mục mới
  const handleCreateCategory = async (data) => {
    try {
      await axiosCustom.post("/techniquetypes", data);
      
      // Sau khi tạo thành công, reload lại dữ liệu để cập nhật danh sách và tổng số item
      fetchCategories(pagination.currentPage, pagination.pageSize);
      toast.success("Tạo danh mục thành công");
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Tạo danh mục thất bại");
    }
  };

  // Cập nhật một danh mục
  const handleUpdateCategory = async (id, data) => {
    try {
      const response = await axiosCustom.put(`/techniquetypes/${id}`, data);
      const updatedCategoryFromServer = response.data;

      // Cập nhật trực tiếp vào state hiện tại (Optimistic update)
      // hoặc bạn có thể gọi fetchCategories() nếu muốn chắc chắn
      setCategories(
        categories.map((c) => (c.id === id ? updatedCategoryFromServer : c))
      );

      toast.success("Cập nhật danh mục thành công");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Cập nhật danh mục thất bại");
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý Danh mục
          </h1>
          <p className="text-foreground/60 mt-2">
            Quản lý danh mục kỹ thuật sơ cứu
          </p>
        </div>
        <CreateCategoryModal onSubmit={handleCreateCategory} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Danh mục</CardTitle>
          <CardDescription>
            {/* Hiển thị thông tin phân trang thay vì chỉ length mảng */}
             Hiển thị {categories.length} trên tổng số {pagination.totalItems} danh mục
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="text-center py-8">Đang tải dữ liệu...</div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Tên danh mục
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Mô tả
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Số kỹ thuật
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-foreground font-medium">
                        {category.name}
                      </td>
                      <td className="py-3 px-4 text-foreground/70">
                        {category.description}
                      </td>
                      <td className="py-3 px-4 text-foreground/70">
                        {/* Kiểm tra null safe cho mảng techniques */}
                        {category.techniques?.length || 0}
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <EditCategoryModal
                          category={category}
                          onSubmit={handleUpdateCategory}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() =>
                            setDeleteConfirm({
                              isOpen: true,
                              categoryId: category.id,
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
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">
                      Không có danh mục nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>

      {/* --- PHẦN UI PHÂN TRANG --- */}
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
              disabled={pagination.currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Trước
            </Button>

             {/* Logic hiển thị số trang */}
             <div className="inline-flex gap-1 mx-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.currentPage) <= 1)
                  .map((page, index, array) => {
                      const showEllipsis = index > 0 && page - array[index - 1] > 1;
                      return (
                        <div key={page} className="flex items-center">
                           {showEllipsis && <span className="mx-1 text-sm">...</span>}
                           <Button
                              variant={pagination.currentPage === page ? "default" : "outline"}
                              size="sm"
                              className={`w-8 h-8 p-0 ${pagination.currentPage === page ? "pointer-events-none" : ""}`}
                              onClick={() => handlePageChange(page)}
                           >
                              {page}
                           </Button>
                        </div>
                      );
                  })
                }
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages || loading}
            >
              Sau
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa */}
      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({
            isOpen: false,
            categoryId: null,
            isDeleting: false,
          })
        }
        onConfirm={() => handleDelete(deleteConfirm.categoryId)}
        title="Xóa Danh Mục"
        description="Bạn chắc chắn muốn xóa danh mục này không? Hành động này không thể hoàn tác."
        isLoading={deleteConfirm.isDeleting}
      />
    </div>
  );
}