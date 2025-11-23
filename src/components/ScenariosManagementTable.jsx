import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, Edit2, Plus } from "lucide-react";
import { CreateScenarioModal } from "./modal/CreateScenarioModal";
import { EditScenarioModal } from "./modal/EditScenarioModal";
import { ConfirmDeleteModal } from "./modal/ConfirmDeleteModal";
import axiosCustom from "@/config/axiosCustom";
import { toast } from "sonner";
export function ScenariosManagementTable() {
  const [scenarios, setScenarios] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    scenarioId: null,
    isDeleting: false,
  });

  //fetch scenarios from API
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await axiosCustom.get("/scenarios");
        setScenarios(response.data.data);
        //console.log("Fetched scenarios:", response.data.data);
      } catch (error) {
        console.error("Error fetching scenarios:", error);
      }
    };
    fetchScenarios();
  }, []);

  // Hàm tạo mới scenario - gọi API
  const handleCreateScenario = async (data) => {
    try {
      const response = await axiosCustom.post("/scenarios", data);
      const newScenario = response.data;
      setScenarios([...scenarios, newScenario]);
      setIsCreateOpen(false);
      toast.success("Tạo scenario thành công!");
      //console.log("Created scenario:", newScenario);
    } catch (error) {
      console.error("Error creating scenario:", error);
      toast.error("Lỗi khi tạo scenario. Vui lòng thử lại.");
    }
  };

  // Hàm chỉnh sửa scenario - gọi API
  const handleEditScenario = async (data) => {
    try {
      const response = await axiosCustom.put(
        `/scenarios/${editingScenario.id}`,
        data
      );
      const updatedScenario = response.data;
      setScenarios(
        scenarios.map((s) =>
          s.id === editingScenario.id ? updatedScenario : s
        )
      );
      setEditingScenario(null);
      toast.success("Cập nhật scenario thành công!");
      console.log("Updated scenario:", updatedScenario);
    } catch (error) {
      console.error("Error updating scenario:", error);
      toast.error("Lỗi khi cập nhật scenario. Vui lòng thử lại.");
    }
  };

  // Hàm xóa scenario - gọi API
  const handleDelete = async (id) => {
    try {
      setDeleteConfirm({ ...deleteConfirm, isDeleting: true });
      await axiosCustom.delete(`/scenarios/${id}`);
      setScenarios(scenarios.filter((s) => s.id !== id));
      toast.success("Xóa scenario thành công!");
      setDeleteConfirm({ isOpen: false, scenarioId: null, isDeleting: false });
      //console.log("Deleted scenario with id:", id);
    } catch (error) {
      console.error("Error deleting scenario:", error);
      toast.error("Lỗi khi xóa scenario. Vui lòng thử lại.");
      setDeleteConfirm({ ...deleteConfirm, isDeleting: false });
    }
  };

  // Hàm mở modal sửa - gọi API lấy chi tiết scenario
  const handleOpenEditModal = async (scenario) => {
    try {
      const response = await axiosCustom.get(`/scenarios/${scenario.id}`);
      const detailedScenario = response.data;
      setEditingScenario(detailedScenario);
      console.log("Fetched scenario details:", detailedScenario);
    } catch (error) {
      console.error("Error fetching scenario details:", error);
      // Nếu lỗi, vẫn mở modal với dữ liệu cơ bản
      setEditingScenario(scenario);
    }
  };

  return (
    <div className="space-y-4">
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

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Scenario</CardTitle>
          <CardDescription>
            Tổng cộng {scenarios.length} scenario
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                {scenarios.map((scenario) => (
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
                          scenario.difficulty === "Dễ"
                            ? "bg-green-50 text-green-700"
                            : scenario.difficulty === "Trung Bình"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {scenario.difficulty === "Dễ"
                          ? "Dễ"
                          : scenario.difficulty === "Trung Bình"
                          ? "Trung bình"
                          : "Khó"}
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
