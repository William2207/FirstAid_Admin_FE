import React, { useState } from "react";
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

const INITIAL_FORM = { name: "", description: "", price: "" };

export function CreateSpecialtyModal({ onSubmit, isSubmitting }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

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

    await onSubmit({ name: formData.name, description: formData.description, price: parseFloat(formData.price) });
    setFormData(INITIAL_FORM);
    setErrors({});
    setOpen(false);
  };

  const handleClose = () => { setFormData(INITIAL_FORM); setErrors({}); setOpen(false); };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" /><path d="M12 5v14" />
        </svg>
        Thêm chuyên khoa
      </button>

      <Modal open={open} onClose={handleClose}>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">Thêm chuyên khoa mới</h2>
          <p className="text-sm text-gray-500 mt-1">Điền thông tin chuyên khoa khám bệnh</p>
        </div>

        <div className="space-y-4">
          {/* Tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên chuyên khoa <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Tim mạch, Nhi khoa, Ngoại khoa..."
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
              placeholder="Mô tả về chuyên khoa này..."
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
              placeholder="VD: 150000"
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
              min={0}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
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
              {isSubmitting ? "Đang tạo..." : "Tạo chuyên khoa"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

CreateSpecialtyModal.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

CreateSpecialtyModal.defaultProps = {
  isSubmitting: false,
};
