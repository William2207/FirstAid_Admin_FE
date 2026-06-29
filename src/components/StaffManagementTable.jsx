import React, { useState, useEffect } from "react";
import axiosCustom from "@/config/axiosCustom";
import { toast } from "sonner";
import { CreateStaffModal } from "./modal/CreateStaffModal";
import { EditStaffModal } from "./modal/EditStaffModal";
import { 
  UserCircle, 
  Mail, 
  Phone, 
  Calendar, 
  Search, 
  Filter, 
  Users, 
  Stethoscope, 
  Heart, 
  Award, 
  Edit3, 
  X, 
  RefreshCw,
  Building,
  UserCheck,
  UserX
} from "lucide-react";

export function StaffManagementTable() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [specialties, setSpecialties] = useState([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
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

  const fetchSpecialties = async () => {
    try {
      const res = await axiosCustom.get("/Specialties/lookup");
      setSpecialties(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách chuyên khoa:", error);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchSpecialties();
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

  const handleUpdateStaff = async (id, updatedData) => {
    setIsSubmitting(true);
    try {
      await axiosCustom.put(`/staff/${id}`, updatedData);
      toast.success("Cập nhật thông tin nhân viên thành công!");
      setShowEditModal(false);
      setEditingStaff(null);
      fetchStaff();
    } catch (error) {
      console.error("Lỗi cập nhật nhân viên:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi cập nhật nhân viên.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await axiosCustom.put(`/staff/${id}/toggle-status`);
      toast.success(response.data.message);
      fetchStaff();
    } catch (error) {
      console.error("Lỗi thay đổi trạng thái:", error);
      toast.error(error.response?.data?.message || "Không thể thay đổi trạng thái nhân viên.");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRole("");
    setSelectedSpecialty("");
  };

  // Tính toán số liệu thống kê
  const totalStaff = staffList.length;
  const doctorCount = staffList.filter(s => s.role?.includes("Doctor")).length;
  const nurseCount = staffList.filter(s => s.role?.includes("Nurse")).length;
  const receptionistCount = staffList.filter(s => s.role?.includes("Receptionist")).length;

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch = 
      staff.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      staff.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = 
      !selectedRole || 
      (staff.role && staff.role.includes(selectedRole));
      
    const matchesSpecialty = 
      !selectedSpecialty || 
      staff.specialtyId === parseInt(selectedSpecialty, 10);
      
    return matchesSearch && matchesRole && matchesSpecialty;
  });

  const getRoleBadge = (roles, isHeadDoctor, isHeadNurse) => {
    if (!roles || roles.length === 0) return <span className="text-gray-500">Nhân viên</span>;
    
    return (
      <div className="flex flex-wrap gap-1.5">
        {roles.map(role => {
          let colorClass = "bg-gray-100 text-gray-800 border-gray-200";
          let roleName = role;
          
          switch (role) {
            case "Doctor":
              colorClass = "bg-blue-50 text-blue-700 border-blue-100";
              roleName = "Bác sĩ";
              break;
            case "Nurse":
              colorClass = "bg-teal-50 text-teal-700 border-teal-100";
              roleName = "Y tá";
              break;
            case "Receptionist":
              colorClass = "bg-purple-50 text-purple-700 border-purple-100";
              roleName = "Tiếp tân";
              break;
          }
          
          return (
            <span key={role} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
              {roleName}
            </span>
          );
        })}
        {isHeadDoctor && (
          <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
            👑 Trưởng khoa
          </span>
        )}
        {isHeadNurse && (
          <span className="inline-flex items-center gap-0.5 bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
            📋 ĐD trưởng
          </span>
        )}
      </div>
    );
  };

  const getSpecialtyBadge = (staff) => {
    if (staff.role?.includes("Receptionist")) {
      return (
        <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-100">
          <Building size={12} className="text-gray-400" />
          Bộ phận tiếp đón
        </span>
      );
    }
    return staff.specialtyName ? (
      <span className="inline-flex items-center gap-1 text-blue-800 bg-blue-50/50 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-100">
        <Building size={12} className="text-blue-400" />
        {staff.specialtyName}
      </span>
    ) : (
      <span className="text-gray-400 italic text-xs">Chưa phân khoa</span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý nhân sự y tế</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Quản lý tài khoản Bác sĩ, Y tá, Tiếp tiếp và phân công vị trí lãnh đạo trong hệ thống khám bệnh.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-lg active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
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
          Thêm nhân viên
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:translate-y-[-2px] transition-all duration-300">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Tổng nhân sự</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{loading ? "..." : totalStaff}</h3>
          </div>
        </div>

        {/* Doctors */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:translate-y-[-2px] transition-all duration-300">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Stethoscope size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Bác sĩ</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{loading ? "..." : doctorCount}</h3>
          </div>
        </div>

        {/* Nurses */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:translate-y-[-2px] transition-all duration-300">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Heart size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Y tá / Điều dưỡng</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{loading ? "..." : nurseCount}</h3>
          </div>
        </div>

        {/* Receptionists */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:translate-y-[-2px] transition-all duration-300">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Tiếp tân</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{loading ? "..." : receptionistCount}</h3>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm theo Tên, Email hoặc Số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all"
            />
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-48 relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="">-- Tất cả vai trò --</option>
              <option value="Doctor">Bác sĩ</option>
              <option value="Nurse">Y tá / Điều dưỡng</option>
              <option value="Receptionist">Tiếp tân</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <Filter size={14} />
            </div>
          </div>

          {/* Specialty Filter */}
          <div className="w-full md:w-56 relative">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="">-- Tất cả chuyên khoa --</option>
              {specialties.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <Filter size={14} />
            </div>
          </div>

          {/* Clear Button */}
          {(searchQuery || selectedRole || selectedSpecialty) && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
            >
              <X size={14} />
              Xóa bộ lọc
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={fetchStaff}
            className="flex items-center justify-center p-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            title="Làm mới danh sách"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-gray-100 rounded-2xl shadow-sm bg-white overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Danh sách nhân sự</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Đang hiển thị {filteredStaff.length} trên tổng số {totalStaff} nhân sự
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-sm font-medium">Đang tải dữ liệu nhân viên...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-4 px-6 font-bold">Nhân viên</th>
                  <th className="py-4 px-6 font-bold">Liên hệ</th>
                  <th className="py-4 px-6 font-bold">Vai trò & Chức vụ</th>
                  <th className="py-4 px-6 font-bold">Chuyên khoa</th>
                  <th className="py-4 px-6 font-bold">Lần cuối hoạt động</th>
                  <th className="py-4 px-6 font-bold text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((staff) => {
                    const isDoc = staff.role?.includes("Doctor");
                    const isNs = staff.role?.includes("Nurse");
                    const ringColor = isDoc 
                      ? "ring-blue-400/25" 
                      : isNs 
                        ? "ring-teal-400/25" 
                        : "ring-purple-400/25";

                    return (
                      <tr key={staff.id} className="hover:bg-gray-50/60 transition-colors group">
                        {/* Avatar & Name */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3.5">
                            {staff.avatar ? (
                              <img 
                                src={staff.avatar} 
                                alt={staff.fullName} 
                                className={`w-11 h-11 rounded-full object-cover ring-4 ${ringColor} transition-transform group-hover:scale-105`} 
                              />
                            ) : (
                              <div className={`w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 ring-4 ${ringColor} transition-transform group-hover:scale-105`}>
                                <UserCircle size={26} className="text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-gray-900 text-[15px] flex items-center gap-1.5">
                                {staff.fullName}
                                {(staff.isHeadDoctor || staff.isHeadNurse) && (
                                  <span className="text-[13px]" title={staff.isHeadDoctor ? "Trưởng khoa" : "Điều dưỡng trưởng"}>
                                    👑
                                  </span>
                                )}
                              </div>
                              <span className="text-gray-400 text-xs font-mono">ID: {staff.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Email & Phone */}
                        <td className="py-3.5 px-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5 text-gray-700">
                             <Mail size={13} className="text-gray-400 shrink-0" />
                             <span className="truncate max-w-[180px]">{staff.email}</span>
                          </div>
                          {staff.phoneNumber && (
                             <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-xs">
                               <Phone size={12} className="text-gray-400 shrink-0" />
                               <span>{staff.phoneNumber}</span>
                             </div>
                          )}
                        </td>

                        {/* Roles & Head status */}
                        <td className="py-3.5 px-6">
                          {getRoleBadge(staff.role, staff.isHeadDoctor, staff.isHeadNurse)}
                        </td>

                        {/* Specialty / Department */}
                        <td className="py-3.5 px-6">
                          {getSpecialtyBadge(staff)}
                        </td>

                        {/* Last Login */}
                        <td className="py-3.5 px-6 text-sm text-gray-500">
                          {staff.lastLoginAt ? (
                            <span className="inline-flex items-center gap-1">
                              <Calendar size={13} className="text-gray-400" />
                              {new Date(staff.lastLoginAt).toLocaleString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric"
                              })}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic text-xs">Chưa hoạt động</span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-6">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingStaff(staff);
                                setShowEditModal(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-blue-600 hover:text-white hover:bg-blue-600 hover:border-blue-600 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
                            >
                              <Edit3 size={13} />
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => handleToggleStatus(staff.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm active:scale-95 cursor-pointer ${
                                staff.isActive 
                                  ? 'text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600' 
                                  : 'text-green-600 hover:text-white hover:bg-green-600 hover:border-green-600'
                              }`}
                            >
                              {staff.isActive ? (
                                <>
                                  <UserX size={13} />
                                  Vô hiệu hóa
                                </>
                              ) : (
                                <>
                                  <UserCheck size={13} />
                                  Kích hoạt
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400">
                      <div className="max-w-xs mx-auto flex flex-col items-center">
                        <Users size={36} className="text-gray-300 mb-2" />
                        <p className="font-semibold text-gray-600 text-sm">Không tìm thấy kết quả</p>
                        <p className="text-xs text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <CreateStaffModal 
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddStaff}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingStaff && (
        <EditStaffModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingStaff(null);
          }}
          onSubmit={handleUpdateStaff}
          staff={editingStaff}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
