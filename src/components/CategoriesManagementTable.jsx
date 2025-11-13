import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { CreateCategoryModal } from "./modal/CreateCategoryModal";
import { EditCategoryModal } from "./modal/EditCategoryModal";
import axiosCustom from "@/config/axiosCustom";
import { toast } from "sonner";
export function CategoriesManagementTable() {
  const [categories, setCategories] = useState([]);

  //Fetch data categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosCustom.get("/techniquetypes");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Xóa một danh mục khỏi state
  const handleDelete = async (id) => {
    // (Tùy chọn) Thêm một bước xác nhận trước khi xóa
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) {
      return; // Dừng lại nếu người dùng không xác nhận
    }

    try {
      // Gửi yêu cầu DELETE đến API để xóa danh mục có id tương ứng
      await axiosCustom.delete(`/techniquetypes/${id}`);

      // Logic này chỉ chạy khi dòng await ở trên không ném ra lỗi
      setCategories(categories.filter((c) => c.id !== id));

      toast.success("Đã xóa danh mục thành công.");
    } catch (error) {
      console.error("Error deleting category:", error);
      let errorMessage = "Không thể xóa danh mục. Vui lòng thử lại.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message; // ← Lấy .message
      } else if (typeof error.response?.data === "string") {
        errorMessage = error.response.data; // nếu backend trả string
      }

      // Hiển thị thông báo lỗi
      toast.error("Thao tác thất bại", {
        description: errorMessage,
      });
    }
  };

  // Thêm một danh mục mới vào state
  const handleCreateCategory = async (data) => {
    try {
      // Gửi yêu cầu POST đến API để tạo danh mục mới
      const response = await axiosCustom.post("/techniquetypes", data);

      // API đã tạo thành công và trả về danh mục mới
      // response.data chính là đối tượng category mới từ server
      const newCategoryFromServer = response.data;

      // Cập nhật state với dữ liệu thực tế từ server
      setCategories([...categories, newCategoryFromServer]);

      // (Tùy chọn) Bạn có thể thêm thông báo thành công ở đây
    } catch (error) {
      // Xử lý lỗi nếu không thể tạo danh mục
      console.error("Error creating category:", error);
      // (Tùy chọn) Hiển thị thông báo lỗi cho người dùng
    }
  };

  // Cập nhật một danh mục trong state
  const handleUpdateCategory = async (id, data) => {
    try {
      const response = await axiosCustom.put(`/techniquetypes/${id}`, data);
      const updatedCategoryFromServer = response.data;

      // Cập nhật lại state với dữ liệu mới nhất từ server
      setCategories(
        categories.map((c) => (c.id === id ? updatedCategoryFromServer : c))
      );

      // (Tùy chọn) Bạn có thể thêm thông báo thành công ở đây
    } catch (error) {
      // Xử lý lỗi nếu không thể cập nhật danh mục
      console.error("Error updating category:", error);
      // (Tùy chọn) Hiển thị thông báo lỗi cho người dùng
    }
  };

  return (
    <div className="space-y-4">
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
            Tổng cộng {categories.length} danh mục
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                {categories.map((category) => (
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
                      {/* Hiển thị độ dài của mảng techniques */}
                      {category.techniques.length}
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
                        onClick={() => handleDelete(category.id)}
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
    </div>
  );
}
