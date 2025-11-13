import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
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
 * Đây là một component Modal đơn giản để thay thế cho Dialog của shadcn/ui.
 * Bạn cần tự thêm CSS để nó hoạt động như một modal thực thụ (overlay, vị trí...).
 */
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 relative max-w-md w-full">
        {/* Nút đóng modal */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          &times; {/* Dấu X */}
        </button>
        {children}
      </div>
    </div>
  );
};

// Định nghĩa prop-types cho Modal
Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export function CreateCategoryModal({ onSubmit }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "bg-green-100",
  });
  const [errors, setErrors] = useState({});

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

    onSubmit(formData);
    // Reset form và đóng modal
    setFormData({
      name: "",
      description: "",
      icon: "",
      color: "bg-green-100",
    });
    setErrors({});
    setOpen(false);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);

  return (
    <>
      {/* Nút để mở Modal */}
      <Button
        onClick={handleOpenModal}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Thêm Danh mục
      </Button>

      {/* Component Modal */}
      <Modal open={open} onClose={handleCloseModal}>
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-bold">Thêm Danh mục mới</h2>
          <p className="text-sm text-gray-500">
            Tạo một danh mục kỹ thuật sơ cứu mới
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
              Thêm danh mục
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// Định nghĩa prop-types cho CreateCategoryModal
CreateCategoryModal.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};
