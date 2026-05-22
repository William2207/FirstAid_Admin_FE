import React, { useState, useEffect } from "react";
import axiosCustom from "@/config/axiosCustom";
import { toast } from "sonner";

export function EditStaffModal({ isOpen, onClose, onSubmit, staff, isSubmitting }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "Doctor",
    specialtyId: "",
    isHead: false,
  });

  const [specialties, setSpecialties] = useState([]);
  const [isFetchingSpecialties, setIsFetchingSpecialties] = useState(false);

  useEffect(() => {
    if (isOpen && staff) {
      const isDoctor = staff.role && staff.role.includes("Doctor");
      const isNurse = staff.role && staff.role.includes("Nurse");
      
      setFormData({
        fullName: staff.fullName || "",
        email: staff.email || "",
        phoneNumber: staff.phoneNumber || "",
        password: "", // Bỏ trống mật khẩu mặc định
        role: staff.role?.[0] || "Doctor",
        specialtyId: staff.specialtyId?.toString() || "",
        isHead: isDoctor ? staff.isHeadDoctor : isNurse ? staff.isHeadNurse : false,
      });
      fetchSpecialties();
    }
  }, [isOpen, staff]);

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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(staff.id, {
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      password: formData.password || null,
      specialtyId: (formData.role === "Doctor" || formData.role === "Nurse") ? parseInt(formData.specialtyId, 10) : null,
      isHead: formData.isHead,
    });
  };

  if (!isOpen) return null;

  const requiresDepartment = formData.role === "Doctor" || formData.role === "Nurse";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 border border-gray-100">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 sticky top-0 backdrop-blur-md z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa nhân viên</h2>
            <p className="text-xs text-gray-500 mt-1">Cập nhật thông tin tài khoản nhân sự</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-800 transition-all text-sm placeholder-gray-400"
              placeholder="Nhập họ và tên..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-800 transition-all text-sm placeholder-gray-400"
              placeholder="example@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Số điện thoại</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-800 transition-all text-sm placeholder-gray-400"
              placeholder="Nhập số điện thoại..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Mật khẩu mới</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-800 transition-all text-sm placeholder-gray-400"
              placeholder="Để trống nếu không muốn thay đổi..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Vai trò</label>
            <input
              type="text"
              value={formData.role === "Doctor" ? "Bác sĩ" : formData.role === "Nurse" ? "Y tá" : "Tiếp tân"}
              disabled
              className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 text-sm cursor-not-allowed"
            />
          </div>

          {requiresDepartment && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Chuyên khoa <span className="text-red-500">*</span></label>
                <select
                  name="specialtyId"
                  required={requiresDepartment}
                  value={formData.specialtyId}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-800 text-sm transition-all"
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

              {/* Checkbox làm Trưởng khoa hoặc Điều dưỡng trưởng */}
              <div className="flex items-center gap-2.5 py-2">
                <input
                  type="checkbox"
                  id="isHead"
                  name="isHead"
                  checked={formData.isHead}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isHead" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                  {formData.role === "Doctor" 
                    ? "Đảm nhận vị trí Trưởng khoa (Head Doctor)" 
                    : "Đảm nhận vị trí Điều dưỡng trưởng (Head Nurse)"}
                </label>
              </div>
            </>
          )}

          <div className="pt-4 flex justify-end gap-2.5 sticky bottom-0 bg-white border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4.5 py-2 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4.5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Đang lưu...
                </>
              ) : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
