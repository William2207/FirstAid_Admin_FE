import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { CreatePracticalCourseModal } from "./modal/CreatePracticalCourseModal";
import { EditPracticalCourseModal } from "./modal/EditPracticalCourseModal";
import { ConfirmDeleteModal } from "./modal/ConfirmDeleteModal";
import axiosCustom from "@/config/axiosCustom";
import { toast } from "sonner";

export function PracticalCourseManagementTable() {
  // --- STATE DỮ LIỆU ---
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // State tìm kiếm

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
    courseId: null,
    isDeleting: false,
  });

  // Hàm gọi API lấy danh sách khóa học thực hành
  const fetchCourses = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      const response = await axiosCustom.get(
        `/practicalcourse?page=${page}&pageSize=${size}`
      );

      const { data, currentPage, totalPages, totalItems, pageSize } =
        response.data;

      setCourses(data);
      setPagination({
        currentPage: currentPage,
        totalPages: totalPages,
        pageSize: pageSize,
        totalItems: totalItems,
      });
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  // useEffect gọi API mỗi khi currentPage thay đổi
  useEffect(() => {
    fetchCourses(pagination.currentPage, pagination.pageSize);
  }, [pagination.currentPage]);

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  // Xóa một khóa học
  const handleDelete = async (id) => {
    try {
      setDeleteConfirm({ ...deleteConfirm, isDeleting: true });
      await axiosCustom.delete(`/practicalcourse/${id}`);

      toast.success("Đã xóa khóa học thành công.");
      setDeleteConfirm({ isOpen: false, courseId: null, isDeleting: false });

      // Logic xử lý khi xóa item cuối cùng của trang
      if (courses.length === 1 && pagination.currentPage > 1) {
        setPagination((prev) => ({
          ...prev,
          currentPage: prev.currentPage - 1,
        }));
      } else {
        fetchCourses(pagination.currentPage, pagination.pageSize);
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      let errorMessage = "Không thể xóa khóa học. Vui lòng thử lại.";
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

  // Thêm một khóa học mới
  const handleCreateCourse = async (data) => {
    try {
      await axiosCustom.post("/practicalcourse", data);

      fetchCourses(pagination.currentPage, pagination.pageSize);
      toast.success("Tạo khóa học thành công");
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Tạo khóa học thất bại");
    }
  };

  // Cập nhật một khóa học
  const handleUpdateCourse = async (id, data) => {
    try {
      const response = await axiosCustom.put(`/practicalcourse/${id}`, data);
      const updatedCourseFromServer = response.data;

      setCourses(
        courses.map((c) => (c.id === id ? updatedCourseFromServer : c))
      );

      toast.success("Cập nhật khóa học thành công");
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error("Cập nhật khóa học thất bại");
    }
  };

  // Format tiền tệ
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Format ngày
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý Khóa học Thực hành
          </h1>
          <p className="text-foreground/60 mt-2">
            Quản lý các khóa học sơ cấp cứu thực hành
          </p>
        </div>
        <CreatePracticalCourseModal onSubmit={handleCreateCourse} />
      </div>

      {/* Thanh tìm kiếm */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Tìm kiếm khóa học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 border border-border rounded-md bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Khóa học</CardTitle>
          <CardDescription>
            Hiển thị{" "}
            {
              courses.filter((c) =>
                c.title.toLowerCase().includes(searchQuery.toLowerCase())
              ).length
            }{" "}
            trên tổng số {pagination.totalItems} khóa học
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Đang tải dữ liệu...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Tiêu đề
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Địa điểm
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Giá
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Ngày bắt đầu
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Học sinh
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
                  {courses.filter((c) =>
                    c.title.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length > 0 ? (
                    courses
                      .filter((c) =>
                        c.title
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((course) => (
                        <tr
                          key={course.id}
                          className="border-b border-border hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-foreground font-medium">
                            <div className="max-w-xs truncate">
                              {course.title}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-foreground/70">
                            {course.location}
                          </td>
                          <td className="py-3 px-4 text-foreground/70">
                            {formatPrice(course.price)}
                          </td>
                          <td className="py-3 px-4 text-foreground/70">
                            {formatDate(course.startDate)}
                          </td>
                          <td className="py-3 px-4 text-foreground/70">
                            {course.enrolledStudents}/{course.maxStudents}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                course.isPublished
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {course.isPublished ? "Đã công bố" : "Bản nháp"}
                            </span>
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <EditPracticalCourseModal
                              course={course}
                              onSubmit={handleUpdateCourse}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-red-600 hover:bg-red-50 bg-transparent"
                              onClick={() =>
                                setDeleteConfirm({
                                  isOpen: true,
                                  courseId: course.id,
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
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchQuery
                          ? "Không tìm thấy khóa học nào."
                          : "Không có khóa học nào."}
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
              disabled={
                pagination.currentPage === pagination.totalPages || loading
              }
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
            courseId: null,
            isDeleting: false,
          })
        }
        onConfirm={() => handleDelete(deleteConfirm.courseId)}
        title="Xóa Khóa học"
        description="Bạn chắc chắn muốn xóa khóa học này không? Hành động này không thể hoàn tác."
        isLoading={deleteConfirm.isDeleting}
      />
    </div>
  );
}
