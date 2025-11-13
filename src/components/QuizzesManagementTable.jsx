import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, Edit2, Plus } from "lucide-react";
import { CreateQuizQuestionModal } from "./modal/CreateQuizQuestionModal";
import { EditQuizQuestionModal } from "./modal/EditQuizQuestionModal";
import axiosCustom from "@/config/axiosCustom";
import { toast } from "sonner";
export function QuizzesManagementTable() {
  // State để lưu danh sách câu hỏi từ API
  const [quizzes, setQuizzes] = useState([]);
  // State để quản lý trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);
  // State để lưu thông báo lỗi nếu gọi API thất bại
  const [error, setError] = useState(null);
  // State quản lý việc mở/đóng modal tạo câu hỏi
  const [createModalOpen, setCreateModalOpen] = useState(false);
  // State quản lý việc mở/đóng modal chỉnh sửa câu hỏi
  const [editModalOpen, setEditModalOpen] = useState(false);
  // State lưu trữ câu hỏi đang được chọn để chỉnh sửa
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // useEffect sẽ chạy một lần sau khi component được render lần đầu
  useEffect(() => {
    // Định nghĩa hàm async để gọi API
    const fetchQuizzes = async () => {
      try {
        setLoading(true); // Bắt đầu quá trình tải
        const response = await axiosCustom.get("/quiz");
        setQuizzes(response.data); // Lưu dữ liệu vào state
        setError(null); // Reset lỗi nếu thành công
      } catch (err) {
        setError("Không thể tải được danh sách câu hỏi.");
        console.error("Error fetching quizzes:", err);
      } finally {
        setLoading(false); // Kết thúc quá trình tải, dù thành công hay thất bại
      }
    };

    fetchQuizzes();
  }, []); // Mảng phụ thuộc rỗng đảm bảo hook này chỉ chạy một lần

  // useMemo để nhóm các câu hỏi theo techniqueId một cách hiệu quả.
  // Hàm này chỉ chạy lại khi state 'quizzes' thay đổi.
  const groupedQuizzes = useMemo(() => {
    if (!quizzes) return {};

    // Sử dụng reduce để chuyển mảng câu hỏi thành một object được nhóm
    return quizzes.reduce((acc, question) => {
      const { techniqueId, techniqueName } = question;

      // Nếu nhóm cho kỹ thuật này chưa có, khởi tạo nó
      if (!acc[techniqueId]) {
        acc[techniqueId] = {
          techniqueName: techniqueName,
          questions: [],
        };
      }

      // Thêm câu hỏi vào nhóm tương ứng
      acc[techniqueId].questions.push(question);

      return acc;
    }, {});
  }, [quizzes]);

  const handleAddQuestion = async (question) => {
    try {
      const response = await axiosCustom.post("/quiz", question);
      const questionFromServer = response.data;
      console.log("Added question from server:", questionFromServer);
      setQuizzes([...quizzes, questionFromServer]);
      setCreateModalOpen(false);
    } catch (error) {
      console.error("Error adding question:", error);
    }
  };

  const handleUpdateQuestion = async (updatedQuestion) => {
    try {
      console.log("Updating question:", updatedQuestion);
      const response = await axiosCustom.put(
        `/quiz/${updatedQuestion.id}`,
        updatedQuestion
      );
      const updatedQuestionFromServer = response.data;
      console.log("Updated question from server:", updatedQuestionFromServer);
      
      setQuizzes(
        quizzes.map((q) =>
          q.id === updatedQuestionFromServer.id ? updatedQuestionFromServer : q
        )
      );
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa câu hỏi này không? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }

    try {
      await axiosCustom.delete(`/quiz/${id}`);
      setQuizzes((prevQuizzes) => prevQuizzes.filter((q) => q.id !== id));

      toast.success("Xóa câu hỏi thành công!");
    } catch (error) {
      console.error("Error deleting question:", error);

      toast.error("Xóa câu hỏi thất bại. Vui lòng thử lại.");
    }
  };

  const handleEditClick = (question) => {
    setSelectedQuestion(question);
    setEditModalOpen(true);
  };

  // Hiển thị giao diện tải trong khi chờ API
  if (loading) {
    return <div className="text-center p-8">Đang tải dữ liệu câu hỏi...</div>;
  }

  // Hiển thị thông báo lỗi nếu API thất bại
  if (error) {
    return <div className="text-center p-8 text-red-600">Lỗi: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Phần Header của trang */}
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

      {/* Lặp qua dữ liệu đã được nhóm để render các Card */}
      {Object.entries(groupedQuizzes).map(([techniqueId, group]) => {
        if (group.questions.length === 0) return null;

        return (
          <Card key={techniqueId}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{group.techniqueName}</CardTitle>
                  <CardDescription>
                    {group.questions.length} câu hỏi
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
                            onClick={() => handleDeleteQuestion(question.id)}
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

      {/* Các component Modal */}
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
    </div>
  );
}
