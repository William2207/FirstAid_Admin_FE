import React, { useState, useEffect } from "react";
import axiosCustom from "@/config/axiosCustom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  X,
  Trash2,
  Heart,
  Flame,
  Droplet,
  Brain,
  Bone,
  Biohazard,
  Sun,
  Activity,
  BeanOff,
  ThermometerSnowflake,
} from "lucide-react";

const ICON_OPTIONS = [
  { name: "Heart", icon: Heart, label: "Trái tim" },
  { name: "Flame", icon: Flame, label: "Lửa" },
  { name: "Droplet", icon: Droplet, label: "Giọt" },
  { name: "Brain", icon: Brain, label: "Não" },
  { name: "Bone", icon: Bone, label: "Xương" },
  { name: "Biohazard", icon: Biohazard, label: "Sinh học Nguy hiểm" },
  { name: "Sun", icon: Sun, label: "Mặt trời" },
  { name: "Activity", icon: Activity, label: "Hoạt động" },
  { name: "BeanOff", icon: BeanOff, label: "Tắt" },
  { name: "ThermometerSnowflake", icon: ThermometerSnowflake, label: "Lạnh" },
];

export function EditTechniqueModal({
  isOpen,
  onClose,
  onSubmit,
  techniqueData,
}) {
  const [activeTab, setActiveTab] = useState("info");
  const [formData, setFormData] = useState(
    techniqueData
      ? {
          name: techniqueData.name,
          title: techniqueData.title,
          description: techniqueData.description,
          difficulty: techniqueData.difficulty,
          videoUrl: techniqueData.videoUrl,
          videoFile: null, // Thêm videoFile
          imageUrl: techniqueData.imageUrl,
          imageFile: null, // Thêm imageFile
          duration: techniqueData.duration,
          icon: techniqueData.icon,
          techniqueTypeId: techniqueData.techniqueTypeId,
        }
      : {
          name: "",
          title: "",
          description: "",
          difficulty: "Trung Bình",
          videoUrl: "",
          videoFile: null,
          imageUrl: "",
          imageFile: null,
          duration: 0,
          icon: "",
          techniqueTypeId: "",
        }
  );
  const [techniqueTypes, setTechniqueTypes] = useState([]);
  const [steps, setSteps] = useState(techniqueData?.techniqueSteps || []);
  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [editingStep, setEditingStep] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [isSavingStep, setIsSavingStep] = useState(false);

  useEffect(() => {
    // Chỉ gọi API khi modal được mở và chưa có dữ liệu
    if (isOpen) {
      const fetchTechniqueTypes = async () => {
        setIsLoadingTypes(true);
        setFetchError(null);
        try {
          const response = await axiosCustom.get("/techniquetypes/all");
          setTechniqueTypes(response.data); // Giả sử API trả về dữ liệu trong response.data
        } catch (error) {
          console.error("Lỗi khi tải loại kỹ thuật:", error);
          setFetchError(
            "Không thể tải danh sách loại kỹ thuật. Vui lòng thử lại."
          );
        } finally {
          setIsLoadingTypes(false);
        }
      };

      fetchTechniqueTypes();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "duration" || name === "techniqueTypeId"
          ? value
            ? Number.parseInt(value)
            : ""
          : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Hàm mới để xử lý việc chọn file
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const validateFormData = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Tên kỹ thuật là bắt buộc";
    if (formData.name.length > 200)
      newErrors.name = "Tên không được vượt quá 200 ký tự";

    if (!formData.title.trim()) newErrors.title = "Tiêu đề là bắt buộc";
    if (formData.title.length > 300)
      newErrors.title = "Tiêu đề không được vượt quá 300 ký tự";

    if (!formData.description.trim())
      newErrors.description = "Mô tả là bắt buộc";

    if (!formData.difficulty) newErrors.difficulty = "Độ khó là bắt buộc";

    if (!formData.techniqueTypeId)
      newErrors.techniqueTypeId = "Loại kỹ thuật là bắt buộc";

    if (formData.duration < 0 || formData.duration > 1440)
      newErrors.duration = "Thời lượng phải từ 0-1440 phút";

    if (formData.videoUrl && formData.videoUrl.length > 500)
      newErrors.videoUrl = "URL video không được vượt quá 500 ký tự";

    if (formData.imageUrl && formData.imageUrl.length > 500)
      newErrors.imageUrl = "URL ảnh không được vượt quá 500 ký tự";

    if (formData.icon && formData.icon.length > 100)
      newErrors.icon = "Icon không được vượt quá 100 ký tự";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditStep = (index) => {
    setEditingStepIndex(index);
    setEditingStep(steps[index]);
  };

  const handleSaveStep = async () => {
    // 1. Kiểm tra xem có step đang sửa và có ID của technique không
    if (!editingStep || !techniqueData?.id) {
      console.error("Thiếu thông tin step hoặc ID của kỹ thuật.");
      alert("Không thể lưu, thiếu thông tin cần thiết.");
      return;
    }

    setIsSavingStep(true);

    // 2. Tạo payload đúng với cấu trúc UpdateTechniqueStepsDto của backend
    const payload = {
      Steps: [editingStep], // Gửi một mảng chỉ chứa 1 step đang được sửa
    };

    try {
      const response = await axiosCustom.put(
        `/techniques/step/${techniqueData.id}`,
        payload
      );

      const updatedStepFromServer = response.data.find(
        (s) => s.id === editingStep.id
      );

      if (updatedStepFromServer) {
        const newSteps = steps.map((step) =>
          step.id === updatedStepFromServer.id ? updatedStepFromServer : step
        );
        setSteps(newSteps);
      }

      // Đóng form chỉnh sửa
      setEditingStepIndex(null);
      setEditingStep(null);

      // (Tùy chọn) Hiển thị thông báo thành công
      // alert("Cập nhật bước thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật bước:", error);
      alert("Đã có lỗi xảy ra khi cập nhật bước. Vui lòng thử lại.");
    } finally {
      setIsSavingStep(false); // Dừng trạng thái loading
    }
  };

  const handleDeleteStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateFormData()) {
      onSubmit({
        ...formData,
        steps,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl my-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div>
            <CardTitle>Sửa kỹ thuật sơ cứu</CardTitle>
            <CardDescription>Chỉnh sửa thông tin kỹ thuật</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Tab Navigation */}
          <div className="flex gap-4 border-b mb-6">
            <button
              onClick={() => setActiveTab("info")}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === "info"
                  ? "border-b-2 border-primary text-primary"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Thông tin kỹ thuật
            </button>
            <button
              onClick={() => setActiveTab("steps")}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === "steps"
                  ? "border-b-2 border-primary text-primary"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Quản lý bước ({steps.length})
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 max-h-[60vh] overflow-y-auto"
          >
            {/* Tab: Thông tin kỹ thuật */}
            {activeTab === "info" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tên kỹ thuật <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    maxLength={200}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    maxLength={300}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Độ khó <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    >
                      <option value="Dễ">Dễ</option>
                      <option value="Trung Bình">Trung Bình</option>
                      <option value="Khó">Khó</option>
                    </select>
                    {errors.difficulty && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.difficulty}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Loại kỹ thuật <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="techniqueTypeId"
                      value={formData.techniqueTypeId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      disabled={isLoadingTypes} // Vô hiệu hóa khi đang tải
                    >
                      <option value="">
                        {isLoadingTypes ? "Đang tải..." : "-- Chọn loại --"}
                      </option>
                      {techniqueTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {errors.techniqueTypeId && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.techniqueTypeId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Thời lượng (phút)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="0"
                      max="1440"
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                    {errors.duration && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.duration}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Biểu tượng Icon
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {ICON_OPTIONS.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <button
                            key={option.name}
                            onClick={() =>
                              handleInputChange({
                                target: { name: "icon", value: option.name },
                              })
                            }
                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                              formData.icon === option.name
                                ? "border-blue-500 bg-blue-50"
                                : "border-border hover:border-blue-300"
                            }`}
                            type="button"
                          >
                            <IconComponent className="w-6 h-6" />
                            {/* <span className="text-xs text-center text-foreground font-medium">
                              {option.label}
                            </span> */}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tải lên video
                  </label>
                  <input
                    type="file"
                    name="videoFile"
                    onChange={handleFileChange}
                    accept="video/*"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {formData.videoFile ? (
                    <p className="text-xs text-gray-500 mt-1">
                      Đã chọn: {formData.videoFile.name}
                    </p>
                  ) : formData.videoUrl ? (
                    <p className="text-xs text-gray-500 mt-1">
                      Video hiện tại: {formData.videoUrl}
                    </p>
                  ) : null}
                  {errors.videoFile && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.videoFile}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tải lên ảnh đại diện
                  </label>
                  <input
                    type="file"
                    name="imageFile"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {formData.imageFile ? (
                    <p className="text-xs text-gray-500 mt-1">
                      Đã chọn: {formData.imageFile.name}
                    </p>
                  ) : formData.imageUrl ? (
                    <p className="text-xs text-gray-500 mt-1">
                      Ảnh hiện tại: {formData.imageUrl}
                    </p>
                  ) : null}
                  {errors.imageFile && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.imageFile}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Quản lý bước */}
            {activeTab === "steps" && (
              <div className="space-y-4">
                {steps.length === 0 ? (
                  <div className="text-center py-8 text-foreground/60">
                    <p>
                      Chưa có bước nào. Vui lòng quay lại trang tạo kỹ thuật để
                      thêm bước.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {steps.map((step, index) => (
                      <div key={index}>
                        {editingStepIndex === index ? (
                          <div className="border border-primary rounded-md p-4 space-y-4 bg-primary/5">
                            <h4 className="font-medium text-foreground">
                              Sửa bước {step.stepNumber}
                            </h4>

                            <div>
                              <label className="block text-sm font-medium text-foreground mb-2">
                                Hướng dẫn
                              </label>
                              <textarea
                                value={editingStep?.instruction || ""}
                                onChange={(e) =>
                                  setEditingStep((prev) =>
                                    prev
                                      ? { ...prev, instruction: e.target.value }
                                      : null
                                  )
                                }
                                rows={2}
                                maxLength={1000}
                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-foreground mb-2">
                                Hành động lưu ý
                              </label>
                              <textarea
                                value={editingStep?.expectedAction || ""}
                                onChange={(e) =>
                                  setEditingStep((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          expectedAction: e.target.value,
                                        }
                                      : null
                                  )
                                }
                                rows={2}
                                maxLength={1000}
                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                  Thời lượng (giây)
                                </label>
                                <input
                                  type="number"
                                  value={editingStep?.duration || 0}
                                  onChange={(e) =>
                                    setEditingStep((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            duration: Number.parseInt(
                                              e.target.value
                                            ),
                                          }
                                        : null
                                    )
                                  }
                                  min="0"
                                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                />
                              </div>

                              {/* <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                  URL ảnh
                                </label>
                                <input
                                  type="text"
                                  value={editingStep?.imageUrl || ""}
                                  onChange={(e) =>
                                    setEditingStep((prev) =>
                                      prev
                                        ? { ...prev, imageUrl: e.target.value }
                                        : null
                                    )
                                  }
                                  maxLength={500}
                                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                />
                              </div> */}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                type="button"
                                onClick={handleSaveStep}
                                className="bg-primary hover:bg-primary/90"
                              >
                                Lưu
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setEditingStepIndex(null);
                                  setEditingStep(null);
                                }}
                              >
                                Hủy
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="border border-border rounded-md p-4 flex items-start justify-between hover:bg-muted/50 transition-colors">
                            <div className="flex-1">
                              <p className="font-medium text-foreground">
                                Bước {step.stepNumber}
                              </p>
                              <p className="text-sm text-foreground/70 line-clamp-2 mt-1">
                                {step.instruction}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditStep(index)}
                              >
                                Sửa
                              </Button>
                              {/* <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteStep(index)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button> */}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Nút hành động */}
          <div className="flex gap-3 justify-end border-t pt-6 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary/90"
            >
              Lưu thay đổi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
