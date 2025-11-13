import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Mảng các tùy chọn màu sắc
const colorOptions = [
  { value: "bg-red-100", label: "Đỏ", hex: "#fee2e2" },
  { value: "bg-orange-100", label: "Cam", hex: "#ffedd5" },
  { value: "bg-yellow-100", label: "Vàng", hex: "#fef3c7" },
  { value: "bg-green-100", label: "Xanh lá", hex: "#dcfce7" },
  { value: "bg-blue-100", label: "Xanh dương", hex: "#dbeafe" },
  { value: "bg-purple-100", label: "Tím", hex: "#f3e8ff" },
  { value: "bg-pink-100", label: "Hồng", hex: "#fce7f3" },
];

/**
 * Component Modal cơ bản để thay thế cho Dialog của shadcn/ui.
 * Bạn có thể cần tùy chỉnh thêm CSS để phù hợp với dự án.
 */
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 relative max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl leading-none"
          aria-label="Đóng"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

// Component EditCategoryModal đã được chuyển đổi
export function EditCategoryModal({ category, onSubmit }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description,
    icon: "", // Icon thường không được truyền qua lại, nên để trống
    color: category.color,
  });
  const [errors, setErrors] = useState({});

  // Xử lý trường hợp `category` prop thay đổi từ bên ngoài
  useEffect(() => {
    setFormData({
      name: category.name,
      description: category.description,
      icon: "",
      color: category.color,
    });
  }, [category]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên danh mục là bắt buộc";
    } else if (formData.name.length > 100) {
      newErrors.name = "Tên danh mục không được vượt quá 100 ký tự";
    }

    if (formData.description.length > 500) {
      newErrors.description = "Mô tả không được vượt quá 500 ký tự";
    }

    if (formData.icon && formData.icon.length > 50) {
      newErrors.icon = "Icon không được vượt quá 50 ký tự";
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(category.id, formData);
    setErrors({});
    setOpen(false);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => {
    setOpen(false);
    // Reset lại form về trạng thái ban đầu khi hủy
    setFormData({
      name: category.name,
      description: category.description,
      icon: "",
      color: category.color,
    });
    setErrors({});
  };

  return (
    <>
      {/* Nút để mở Modal (Trigger) */}
      <button
        onClick={handleOpenModal}
        className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
      >
        {/* SVG thay thế cho icon Edit2 từ lucide-react */}
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
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
        Sửa
      </button>

      {/* Component Modal */}
      <Modal open={open} onClose={handleCloseModal}>
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-bold">Sửa Danh mục</h2>
          <p className="text-sm text-gray-500">
            Cập nhật thông tin danh mục kỹ thuật sơ cứu
          </p>
        </div>

        {/* Form body */}
        <div className="space-y-4">
          {/* Tên danh mục */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên danh mục <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Tim mạch, Ngoài da..."
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full p-2 border rounded ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.name.length}/100
            </p>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              placeholder="Mô tả chi tiết về danh mục này"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={`w-full p-2 border rounded ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              rows={3}
              maxLength={500}
            />
            {errors.description && (
              <p className="text-xs text-red-600 mt-1">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500
            </p>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <input
              type="text"
              placeholder="VD: heart, bandage, droplet..."
              value={formData.icon}
              onChange={(e) => handleChange("icon", e.target.value)}
              className={`w-full p-2 border rounded ${
                errors.icon ? "border-red-500" : "border-gray-300"
              }`}
              maxLength={50}
            />
            {errors.icon && (
              <p className="text-xs text-red-600 mt-1">{errors.icon}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.icon.length}/50
            </p>
          </div>

          {/* Màu sắc */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn màu sắc
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleChange("color", color.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded border-2 transition-all ${
                    formData.color === color.value
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                  title={color.label}
                >
                  <div className={`w-8 h-8 rounded ${color.value}`}></div>
                  <span className="text-xs text-gray-800">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Cập nhật danh mục
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// Định nghĩa prop-types cho EditCategoryModal
EditCategoryModal.propTypes = {
  // `category` là một object chứa thông tin của danh mục cần sửa
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  }).isRequired,
  // `onSubmit` là một hàm sẽ được gọi khi form được submit thành công
  onSubmit: PropTypes.func.isRequired,
};
