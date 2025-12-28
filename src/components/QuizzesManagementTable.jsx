import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, Edit2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { CreateQuizQuestionModal } from "./modal/CreateQuizQuestionModal";
import { EditQuizQuestionModal } from "./modal/EditQuizQuestionModal";
import { ConfirmDeleteModal } from "./modal/ConfirmDeleteModal";
import axiosCustom from "@/config/axiosCustom";
import { toast } from "sonner";

export function QuizzesManagementTable() {
  // --- STATE DỮ LIỆU ---
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // State tìm kiếm theo technique name

  // --- STATE PHÂN TRANG ---
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
  });

  // --- STATE MODAL ---
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    questionId: null,
    isDeleting: false,
  });

  // Hàm gọi API lấy danh sách (được tách ra để tái sử dụng)
  const fetchQuizzes = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      // Truyền tham số page và pageSize vào query string
      // API của bạn có thể dùng ?page=...&pageSize=... hoặc ?page=...&limit=...
      // Hãy điều chỉnh 'pageSize' thành 'limit' nếu backend yêu cầu tên đó.
      const response = await axiosCustom.get(
        `/quiz?page=${page}&pageSize=${size}`
      );

      const { data, currentPage, totalPages, totalItems, pageSize } =
        response.data;

      console.log("Fetched quizzes:", response.data);
      setQuizzes(data);

      // Cập nhật state phân trang từ response
      setPagination({
        currentPage: currentPage,
        totalPages: totalPages,
        pageSize: pageSize,
        totalItems: totalItems,
      });
      setError(null);
    } catch (err) {
      setError("Không thể tải được danh sách câu hỏi.");
      console.error("Error fetching quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect chạy khi component mount hoặc khi currentPage thay đổi
  useEffect(() => {
    fetchQuizzes(pagination.currentPage, pagination.pageSize);
  }, [pagination.currentPage]); // Chỉ phụ thuộc vào currentPage (pageSize thường cố định)

  // Nhóm câu hỏi (Logic giữ nguyên)
  const groupedQuizzes = useMemo(() => {
    if (!quizzes) return {};
    return quizzes.reduce((acc, question) => {
      const { techniqueId, techniqueName } = question;
      if (!acc[techniqueId]) {
        acc[techniqueId] = {
          techniqueName: techniqueName,
          questions: [],
        };
      }
      acc[techniqueId].questions.push(question);
      return acc;
    }, {});
  }, [quizzes]);

  // --- XỬ LÝ SỰ KIỆN ---

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleAddQuestion = async (question) => {
    try {
      await axiosCustom.post("/quiz", question);
      toast.success("Thêm câu hỏi thành công!");
      setCreateModalOpen(false);
      // Refresh lại data để thấy item mới (và cập nhật phân trang)
      fetchQuizzes(pagination.currentPage, pagination.pageSize);
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Thêm thất bại");
    }
  };

  const handleUpdateQuestion = async (updatedQuestion) => {
    try {
      const response = await axiosCustom.put(
        `/quiz/${updatedQuestion.id}`,
        updatedQuestion
      );
      // Với Update, có thể cập nhật state local để tránh loading lại trang
      const updatedQuestionFromServer = response.data;
      setQuizzes(
        quizzes.map((q) =>
          q.id === updatedQuestionFromServer.id ? updatedQuestionFromServer : q
        )
      );
      setEditModalOpen(false);
      toast.success("Cập nhật thành công!");
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Cập nhật thất bại");
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      setDeleteConfirm({ ...deleteConfirm, isDeleting: true });
      await axiosCustom.delete(`/quiz/${id}`);

      toast.success("Xóa câu hỏi thành công!");
      setDeleteConfirm({ isOpen: false, questionId: null, isDeleting: false });

      // Logic xử lý khi xóa item cuối cùng của trang
      if (quizzes.length === 1 && pagination.currentPage > 1) {
        // Nếu trang hiện tại chỉ còn 1 item và xóa nó -> lùi về trang trước
        setPagination((prev) => ({
          ...prev,
          currentPage: prev.currentPage - 1,
        }));
      } else {
        // Ngược lại, reload trang hiện tại
        fetchQuizzes(pagination.currentPage, pagination.pageSize);
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Xóa câu hỏi thất bại.");
      setDeleteConfirm({ ...deleteConfirm, isDeleting: false });
    }
  };

  const handleEditClick = (question) => {
    setSelectedQuestion(question);
    setEditModalOpen(true);
  };

  // --- RENDER ---

  if (loading && quizzes.length === 0) {
    return <div className="text-center p-8">Đang tải dữ liệu câu hỏi...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">Lỗi: {error}</div>;
  }

  return (
    <div className="space-y-4 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý Câu Hỏi Quiz
          </h1>
          <p className="text-foreground/60 mt-2">
            Quản lý toàn bộ câu hỏi quiz cho các kỹ thuật sơ cứu
          </p>
        </div>
        <Button
          className="gap-2 bg-primary hover:bg-primary/90"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Thêm Câu Hỏi
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên kỹ thuật..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 border border-border rounded-md bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Danh sách câu hỏi */}
      {Object.entries(groupedQuizzes)
        .filter(([_, group]) =>
          group.techniqueName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(([techniqueId, group]) => {
          if (group.questions.length === 0) return null;

          return (
            <Card key={techniqueId} className="mb-4">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{group.techniqueName}</CardTitle>
                    <CardDescription>
                      Hiển thị {group.questions.length} câu hỏi trong trang này
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">
                          Câu Hỏi
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">
                          Độ Khó
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">
                          Số Tùy Chọn
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">
                          Hành Động
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.questions.map((question) => (
                        <tr
                          key={question.id}
                          className="border-b border-border hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-foreground font-medium max-w-xs truncate">
                            {question.questionText}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                question.difficulty === "Easy"
                                  ? "bg-green-50 text-green-700"
                                  : question.difficulty === "Medium"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {question.difficulty === "Easy"
                                ? "Dễ"
                                : question.difficulty === "Medium"
                                ? "Trung bình"
                                : "Khó"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-foreground/70">
                            {question.answerOptions.length}
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 bg-transparent"
                              onClick={() => handleEditClick(question)}
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
                                  questionId: question.id,
                                  isDeleting: false,
                                })
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                              Xóa
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })}

      {/* Thông báo khi không có kết quả tìm kiếm */}
      {searchQuery &&
        Object.entries(groupedQuizzes).filter(([_, group]) =>
          group.techniqueName.toLowerCase().includes(searchQuery.toLowerCase())
        ).length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Không tìm thấy kỹ thuật nào phù hợp.
            </CardContent>
          </Card>
        )}

      {/* --- PHÂN TRANG (PAGINATION UI) --- */}
      {pagination.totalPages > 0 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Trang {pagination.currentPage} / {pagination.totalPages}(
            {pagination.totalItems} kết quả)
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

            {/* Hiển thị các số trang (đơn giản) */}
            <div className="inline-flex gap-1 mx-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                // Chỉ hiện trang đầu, cuối, và xung quanh trang hiện tại (optional logic)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === pagination.totalPages ||
                    Math.abs(p - pagination.currentPage) <= 1
                )
                .map((page, index, array) => {
                  // Logic thêm dấu "..." nếu danh sách bị ngắt quãng
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;

                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && <span className="mx-1">...</span>}
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

      {/* Modals */}
      <CreateQuizQuestionModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onAdd={handleAddQuestion}
      />

      <EditQuizQuestionModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        question={selectedQuestion}
        onUpdate={handleUpdateQuestion}
      />

      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({
            isOpen: false,
            questionId: null,
            isDeleting: false,
          })
        }
        onConfirm={() => handleDeleteQuestion(deleteConfirm.questionId)}
        title="Xóa Câu Hỏi"
        description="Bạn chắc chắn muốn xóa câu hỏi này không? Hành động này không thể hoàn tác."
        isLoading={deleteConfirm.isDeleting}
      />
    </div>
  );
}
