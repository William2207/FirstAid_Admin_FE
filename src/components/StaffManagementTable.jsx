import React, { useState, useEffect } from "react";
import axiosCustom from "@/config/axiosCustom";
import { toast } from "sonner";
import { CreateStaffModal } from "./modal/CreateStaffModal";
import { UserCircle, Mail, Phone, Calendar } from "lucide-react";

export function StaffManagementTable() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axiosCustom.get("/staff/all");
      setStaffList(response.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách nhân sự:", error);
      toast.error("Không thể tải danh sách nhân sự.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        specialtyId: formData.role !== "Receptionist" ? parseInt(formData.specialtyId, 10) : 0
      };

      await axiosCustom.post("/Account/create-account-admin", payload);
      toast.success(`Tạo tài khoản ${formData.role} thành công!`);
      setShowAddModal(false);
      fetchStaff();
    } catch (error) {
      console.error("Lỗi tạo nhân sự:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi tạo tài khoản.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (roles) => {
    if (!roles || roles.length === 0) return <span className="text-gray-500">Người dùng</span>;
    
    return roles.map(role => {
      let colorClass = "bg-gray-100 text-gray-800";
      let roleName = role;
      
      switch (role) {
        case "Doctor":
          colorClass = "bg-blue-100 text-blue-800";
          roleName = "Bác sĩ";
          break;
        case "Nurse":
          colorClass = "bg-teal-100 text-teal-800";
          roleName = "Y tá";
          break;
        case "Receptionist":
          colorClass = "bg-purple-100 text-purple-800";
          roleName = "Tiếp tân";
          break;
      }
      
      return (
        <span key={role} className={`px-2 py-1 rounded-full text-xs font-medium mr-1 ${colorClass}`}>
          {roleName}
        </span>
      );
    });
  };

  const filteredStaff = staffList.filter((staff) => 
    staff.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    staff.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý nhân viên y tế</h1>
          <p className="text-gray-500 mt-2">
            Quản lý tài khoản Bác sĩ, Y tá và Tiếp tân trong hệ thống
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Thêm nhân viên
        </button>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Tìm kiếm theo Tên hoặc Email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="border rounded-lg shadow-sm bg-white">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Danh sách nhân viên</h2>
          <p className="text-gray-600">
            Tổng cộng: {filteredStaff.length} người
          </p>
        </div>
        <div className="p-0">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nhân viên</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Liên hệ</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Vai trò</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Lần cuối đăng nhập</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((staff) => (
                      <tr key={staff.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {staff.avatar ? (
                              <img src={staff.avatar} alt={staff.fullName} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                <UserCircle size={24} />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{staff.fullName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                             <Mail size={14} className="text-gray-400" />
                             <span>{staff.email}</span>
                          </div>
                          {staff.phoneNumber && (
                             <div className="flex items-center gap-1 mt-1">
                               <Phone size={14} className="text-gray-400" />
                               <span>{staff.phoneNumber}</span>
                             </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {getRoleBadge(staff.role)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {staff.lastLoginAt ? new Date(staff.lastLoginAt).toLocaleString("vi-VN") : "Chưa từng đăng nhập"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">
                        {searchQuery ? "Không tìm thấy nhân viên nào phù hợp." : "Không có dữ liệu nhân viên."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <CreateStaffModal 
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddStaff}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
