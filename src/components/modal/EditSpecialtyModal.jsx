import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl relative max-w-md w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="sticky top-0 right-0 float-right text-gray-500 hover:text-gray-800 p-6 pb-2"
        >
          &times;
        </button>
        <div className="p-6 pt-0">{children}</div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export function EditSpecialtyModal({ specialty, onSubmit, isSubmitting }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  // Đồng bộ dữ liệu khi mở modal
  useEffect(() => {
    if (open && specialty) {
      setFormData({
        name: specialty.name || "",
        description: specialty.description || "",
        price: specialty.price?.toString() || "0",
        isActive: specialty.isActive ?? true,
      });
      setErrors({});
    }
  }, [open, specialty]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Tên chuyên khoa là bắt buộc.";
    else if (formData.name.length > 100) newErrors.name = "Tên không được vượt quá 100 ký tự.";
    if (formData.description.length > 500) newErrors.description = "Mô tả không được vượt quá 500 ký tự.";
    const price = parseFloat(formData.price);
    if (formData.price === "" || isNaN(price) || price < 0)
      newErrors.price = "Giá phải là số không âm.";
    return newErrors;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    await onSubmit(specialty.id, {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      isActive: formData.isActive,
    });
    setOpen(false);
  };

  const handleClose = () => { setErrors({}); setOpen(false); };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Sửa
      </button>

      <Modal open={open} onClose={handleClose}>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">Chỉnh sửa chuyên khoa</h2>
          <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin chuyên khoa</p>
        </div>

        <div className="space-y-4">
          {/* Tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên chuyên khoa <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              maxLength={100}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            <p className="text-xs text-gray-400 mt-1">{formData.name.length}/100</p>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              maxLength={500}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.description ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
            <p className="text-xs text-gray-400 mt-1">{formData.description.length}/500</p>
          </div>

          {/* Giá */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá khám (VND) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
              min={0}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
          </div>

          {/* Trạng thái */}
          <div className="flex items-center gap-3">
            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
            <button
              type="button"
              onClick={() => handleChange("isActive", !formData.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${formData.isActive ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
            <span className={`text-sm font-medium ${formData.isActive ? "text-green-600" : "text-gray-400"}`}>
              {formData.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : null}
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

EditSpecialtyModal.propTypes = {
  specialty: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    isActive: PropTypes.bool,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

EditSpecialtyModal.defaultProps = {
  isSubmitting: false,
};
