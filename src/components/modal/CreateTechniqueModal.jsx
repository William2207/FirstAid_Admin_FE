import React, { useState, useEffect } from "react";
import axiosCustom from "@/config/axiosCustom";

/**
 * Component Modal để tạo kỹ thuật sơ cứu mới.
 * @param {object} props
 * @param {boolean} props.isOpen - Trạng thái hiển thị của modal.
 * @param {function} props.onClose - Hàm để đóng modal.
 * @param {function} props.onSubmit - Hàm được gọi khi form được gửi đi.
 */
export function CreateTechniqueModal({ isOpen, onClose, onSubmit }) {
  const initialFormData = {
    name: "",
    title: "",
    description: "",
    difficulty: "Trung bình",
    videoFile: null, // Thay đổi từ videoUrl
    imageFile: null, // Thay đổi từ imageUrl
    duration: 0,
    icon: "",
    techniqueTypeId: "",
    steps: [],
  };

  const initialStepData = {
    stepNumber: 1,
    instruction: "",
    expectedAction: "",
    duration: 0,
    imageFile: null, // Thay đổi từ imageUrl
  };

  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(initialStepData);
  const [errors, setErrors] = useState({});

  const [techniqueTypes, setTechniqueTypes] = useState([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    // Chỉ gọi API khi modal được mở và chưa có dữ liệu
    if (isOpen) {
      const fetchTechniqueTypes = async () => {
        setIsLoadingTypes(true);
        setFetchError(null);
        try {
          // Thay đổi '/technique-types' thành endpoint API thực tế của bạn
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

  const handleStepChange = (e) => {
    const { name, value, files } = e.target;
    // Xử lý riêng cho input file
    if (e.target.type === "file") {
      if (files.length > 0) {
        setCurrentStep((prev) => ({
          ...prev,
          [name]: files[0],
        }));
      }
    } else {
      setCurrentStep((prev) => ({
        ...prev,
        [name]:
          name === "duration" || name === "stepNumber"
            ? value
              ? Number.parseInt(value)
              : 0
            : value,
      }));
    }
  };

  const validateStep = () => {
    const newErrors = {};
    if (currentStep.stepNumber <= 0)
      newErrors.stepNumber = "Số bước phải lớn hơn 0";
    if (!currentStep.instruction.trim())
      newErrors.instruction = "Hướng dẫn là bắt buộc";
    if (currentStep.instruction.length > 1000)
      newErrors.instruction = "Hướng dẫn không được vượt quá 1000 ký tự";
    if (!currentStep.expectedAction.trim())
      newErrors.expectedAction = "Hành động lưu ý là bắt buộc";
    if (currentStep.expectedAction.length > 1000)
      newErrors.expectedAction =
        "Hành động lưu ý không được vượt quá 1000 ký tự";
    if (currentStep.duration < 0) newErrors.duration = "Thời lượng phải >= 0";

    // Bạn có thể thêm validation cho file ở đây (ví dụ: kích thước, loại file)
    // if (currentStep.imageFile && currentStep.imageFile.size > 5 * 1024 * 1024)
    //   newErrors.imageFile = "Kích thước ảnh không được vượt quá 5MB";

    return newErrors;
  };

  const addStep = () => {
    const stepErrors = validateStep();
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    const nextStepNumber =
      formData.steps.length > 0
        ? Math.max(...formData.steps.map((s) => s.stepNumber)) + 1
        : 1;
    const newStep = {
      ...currentStep,
      stepNumber: currentStep.stepNumber || nextStepNumber,
    };
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
    setCurrentStep({
      ...initialStepData,
      stepNumber: (currentStep.stepNumber || nextStepNumber) + 1,
    });
    setErrors({});
  };

  const removeStep = (indexToRemove) => {
    const updatedSteps = formData.steps.filter(
      (_, index) => index !== indexToRemove
    );
    setFormData((prev) => ({
      ...prev,
      steps: updatedSteps,
    }));
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
    if (formData.icon && formData.icon.length > 100)
      newErrors.icon = "Icon không được vượt quá 100 ký tự";
    if (formData.steps.length === 0)
      newErrors.steps = "Phải thêm ít nhất 1 bước";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateFormData()) {
      // Khi gửi đi, formData sẽ chứa các đối tượng File thay vì URL.
      // Cần xử lý upload file ở component cha.
      onSubmit(formData);
      setFormData(initialFormData);
      setCurrentStep(initialStepData);
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl my-8 rounded-lg shadow-xl border">
        <div className="flex flex-row items-center justify-between p-6 pb-4 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Tạo kỹ thuật sơ cứu mới
            </h2>
            <p className="text-sm text-gray-500">
              Điền thông tin chi tiết về kỹ thuật sơ cứu
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 pt-6 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* --- Thông tin cơ bản --- */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Thông tin cơ bản</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên kỹ thuật <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  maxLength={200}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: CPR cơ bản"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {formData.name.length}/200
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  maxLength={300}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tiêu đề cho kỹ thuật"
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                )}
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {formData.title.length}/300
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả chi tiết về kỹ thuật"
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Độ khó <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  {/* Hiển thị lỗi nếu không tải được dữ liệu */}
                  {fetchError && (
                    <p className="text-xs text-red-500 mt-1">{fetchError}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="0"
                    max="1440"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.duration && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.duration}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="heart, activity, etc."
                  />
                  {errors.icon && (
                    <p className="text-xs text-red-500 mt-1">{errors.icon}</p>
                  )}
                </div>
              </div>
              {/* --- Thay đổi input video --- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tải lên video
                </label>
                <input
                  type="file"
                  name="videoFile"
                  onChange={handleFileChange}
                  accept="video/*"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.videoFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    Đã chọn: {formData.videoFile.name}
                  </p>
                )}
                {errors.videoFile && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.videoFile}
                  </p>
                )}
              </div>
              {/* --- Thay đổi input ảnh --- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tải lên ảnh đại diện
                </label>
                <input
                  type="file"
                  name="imageFile"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.imageFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    Đã chọn: {formData.imageFile.name}
                  </p>
                )}
                {errors.imageFile && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.imageFile}
                  </p>
                )}
              </div>
            </div>

            {/* --- Thêm bước --- */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-gray-800">
                Thêm các bước thực hiện
              </h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-4 border">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số bước <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stepNumber"
                    value={currentStep.stepNumber}
                    onChange={handleStepChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Nhập số bước"
                  />
                  {errors.stepNumber && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.stepNumber}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hướng dẫn <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="instruction"
                    value={currentStep.instruction}
                    onChange={handleStepChange}
                    maxLength={1000}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Hướng dẫn chi tiết cho bước này"
                  />
                  {errors.instruction && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.instruction}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {currentStep.instruction.length}/1000
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hành động lưu ý <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="expectedAction"
                    value={currentStep.expectedAction}
                    onChange={handleStepChange}
                    maxLength={1000}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Hành động mà người thực hiện sẽ làm"
                  />
                  {errors.expectedAction && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.expectedAction}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {currentStep.expectedAction.length}/1000
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời lượng (giây)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={currentStep.duration}
                      onChange={handleStepChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {errors.duration && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.duration}
                      </p>
                    )}
                  </div>
                  {/* --- Thay đổi input ảnh cho từng bước --- */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tải lên ảnh cho bước
                    </label>
                    <input
                      type="file"
                      name="imageFile"
                      onChange={handleStepChange}
                      accept="image/*"
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {currentStep.imageFile && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Đã chọn: {currentStep.imageFile.name}
                      </p>
                    )}
                    {errors.imageFile && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.imageFile}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addStep}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  Thêm bước
                </button>
              </div>
              {formData.steps.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">
                    Các bước đã thêm ({formData.steps.length})
                  </h4>
                  {formData.steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between bg-white p-3 rounded-md border"
                    >
                      <div className="flex-1 mr-2">
                        <p className="font-medium text-gray-800">
                          Bước {step.stepNumber}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {step.instruction}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
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
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.steps && (
                <p className="text-xs text-red-500 mt-1">{errors.steps}</p>
              )}
            </div>

            {/* --- Nút hành động --- */}
            <div className="flex gap-3 justify-end border-t pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 font-medium text-gray-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Tạo kỹ thuật
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
