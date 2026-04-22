import React, { useState, useEffect } from "react";
import axiosCustom from "@/config/axiosCustom";
import { toast } from "sonner";

export function CreateStaffModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Doctor",
    specialtyId: "",
  });

  const [specialties, setSpecialties] = useState([]);
  const [isFetchingSpecialties, setIsFetchingSpecialties] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSpecialties();
    }
  }, [isOpen]);

  const fetchSpecialties = async () => {
    try {
      setIsFetchingSpecialties(true);
      const res = await axiosCustom.get("/Specialties/lookup");
      setSpecialties(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách chuyên khoa:", error);
      toast.error("Không thể tải danh sách chuyên khoa");
    } finally {
      setIsFetchingSpecialties(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  const requiresDepartment = formData.role === "Doctor" || formData.role === "Nurse";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold">Thêm nhân viên y tế mới</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Họ và tên <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập họ và tên..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example@email.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mật khẩu <span className="text-red-500">*</span></label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mật khẩu mặc định..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Vai trò <span className="text-red-500">*</span></label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Doctor">Bác sĩ</option>
              <option value="Nurse">Y tá</option>
              <option value="Receptionist">Tiếp tân</option>
            </select>
          </div>

          {requiresDepartment && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Chuyên khoa <span className="text-red-500">*</span></label>
              <select
                name="specialtyId"
                required={requiresDepartment}
                value={formData.specialtyId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                disabled={isFetchingSpecialties}
              >
                <option value="">-- Chọn chuyên khoa --</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2 sticky bottom-0 bg-white border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
