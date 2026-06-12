import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Bed, Building2, Stethoscope, Filter } from "lucide-react";
import axiosCustom from "../config/axiosCustom";
import { toast } from "sonner";

export const WardManagementTable = () => {
  const [wards, setWards] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [floorFilter, setFloorFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: "",
    specialityId: "",
    wardType: "GENERAL",
    floor: "",
    numberOfBeds: 5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWards();
    fetchSpecialties();
  }, []);

  const fetchWards = async () => {
    try {
      setLoading(true);
      const res = await axiosCustom.get("/Ward/admin/all");
      setWards(res.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách phòng:", error);
      toast.error("Không thể tải danh sách phòng bệnh");
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const res = await axiosCustom.get("/Specialties/lookup");
      setSpecialties(res.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách chuyên khoa:", error);
    }
  };

  const handleOpenModal = (ward = null) => {
    if (ward) {
      setEditingWard(ward);
      setFormData({
        roomNumber: ward.roomNumber,
        specialityId: ward.specialityId.toString(),
        wardType: ward.wardType,
        floor: ward.floor.toString(),
        numberOfBeds: 0, // Không sửa số giường khi edit
      });
    } else {
      setEditingWard(null);
      setFormData({
        roomNumber: "",
        specialityId: specialties.length > 0 ? specialties[0].id.toString() : "",
        wardType: "GENERAL",
        floor: "1",
        numberOfBeds: 5,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWard(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        roomNumber: formData.roomNumber,
        specialityId: parseInt(formData.specialityId),
        wardType: formData.wardType,
        floor: parseInt(formData.floor),
        numberOfBeds: editingWard ? undefined : parseInt(formData.numberOfBeds),
      };

      if (editingWard) {
        await axiosCustom.put(`/Ward/admin/update/${editingWard.id}`, payload);
        toast.success("Cập nhật phòng bệnh thành công!");
      } else {
        await axiosCustom.post("/Ward/admin/create", payload);
        toast.success("Tạo phòng bệnh mới thành công!");
      }
      fetchWards();
      handleCloseModal();
    } catch (error) {
      console.error("Lỗi lưu phòng:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu phòng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phòng này? Không thể xóa nếu phòng đang có bệnh nhân.")) return;

    try {
      await axiosCustom.delete(`/Ward/admin/delete/${id}`);
      toast.success("Đã xóa phòng bệnh");
      fetchWards();
    } catch (error) {
      console.error("Lỗi xóa phòng:", error);
      toast.error(error.response?.data?.message || "Không thể xóa phòng");
    }
  };

  const filteredWards = wards.filter((w) => {
    const matchSearch = w.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === "ALL" || w.wardType === typeFilter;
    const matchFloor = floorFilter === "ALL" || w.floor.toString() === floorFilter;
    return matchSearch && matchType && matchFloor;
  });

  const uniqueFloors = [...new Set(wards.map((w) => w.floor))].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Quản lý Khoa & Phòng</h2>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý sơ đồ phòng bệnh, phân bổ khoa và theo dõi sức chứa.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0058be] text-white rounded-lg hover:bg-[#004395] transition-colors shadow-sm font-medium"
        >
          <Plus className="w-5 h-5" />
          Thêm Phòng Mới
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-[#faf8ff] text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:border-transparent transition-all"
            placeholder="Tìm kiếm theo số phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-[#faf8ff] border border-slate-200 text-slate-700 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
            >
              <option value="ALL">Tất cả loại</option>
              <option value="GENERAL">Phòng thường</option>
              <option value="ICU">Hồi sức tích cực (ICU)</option>
              <option value="EMERGENCY">Cấp cứu</option>
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="appearance-none bg-[#faf8ff] border border-slate-200 text-slate-700 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
            >
              <option value="ALL">Tất cả tầng</option>
              {uniqueFloors.map((f) => (
                <option key={f} value={f}>
                  Tầng {f}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid of Cards instead of a dense table to fit the clinical aesthetic */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0058be]"></div>
        </div>
      ) : filteredWards.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Building2 className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-2 text-sm font-semibold text-slate-900">Không tìm thấy phòng bệnh</h3>
          <p className="mt-1 text-sm text-slate-500">Thử điều chỉnh bộ lọc hoặc thêm phòng mới.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWards.map((ward) => (
            <div key={ward.id} className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.05)] overflow-hidden flex flex-col hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-shadow">
              {/* Card Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-[#131b2e] flex items-center gap-2">
                    {ward.roomNumber}
                    {ward.wardType === "ICU" && <span className="px-2 py-0.5 text-[10px] font-bold bg-[#ffdad6] text-[#93000a] rounded-full uppercase tracking-wider">ICU</span>}
                    {ward.wardType === "EMERGENCY" && <span className="px-2 py-0.5 text-[10px] font-bold bg-[#fbfdff] text-[#444749] border border-[#c2c6d6] rounded-full uppercase tracking-wider">Cấp cứu</span>}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 text-sm text-[#54647a]">
                    <Building2 className="w-4 h-4" />
                    <span>Tầng {ward.floor}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(ward)} className="p-2 text-slate-400 hover:text-[#0058be] hover:bg-[#eef0ff] rounded-lg transition-colors" title="Chỉnh sửa">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(ward.id)} className="p-2 text-slate-400 hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors" title="Xóa">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#eef0ff] flex items-center justify-center text-[#0058be]">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#54647a] uppercase tracking-wider">Chuyên khoa</p>
                    <p className="font-medium text-[#131b2e]">{ward.specialityName || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f2f3ff] flex items-center justify-center text-[#505f76]">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                      <p className="text-xs font-semibold text-[#54647a] uppercase tracking-wider">Tình trạng giường</p>
                      <p className="text-sm font-semibold text-[#131b2e]">
                        {ward.occupiedBeds} / {ward.totalBeds}
                      </p>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${ward.occupiedBeds === ward.totalBeds ? "bg-[#ba1a1a]" : "bg-[#0058be]"}`}
                        style={{ width: `${ward.totalBeds > 0 ? (ward.occupiedBeds / ward.totalBeds) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-[0_12px_32px_rgba(15,23,42,0.1)] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#faf8ff]">
              <h3 className="text-xl font-bold text-[#131b2e]">
                {editingWard ? "Chỉnh sửa Phòng" : "Thêm Phòng & Giường Mới"}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#131b2e] mb-1">Số phòng / Tên phòng</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-white border border-[#c2c6d6] rounded-xl focus:ring-2 focus:ring-[#0058be] focus:border-transparent outline-none transition-all"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="VD: P.301"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#131b2e] mb-1">Chuyên khoa</label>
                <select
                  required
                  className="w-full px-4 py-2 bg-white border border-[#c2c6d6] rounded-xl focus:ring-2 focus:ring-[#0058be] focus:border-transparent outline-none transition-all"
                  value={formData.specialityId}
                  onChange={(e) => setFormData({ ...formData, specialityId: e.target.value })}
                >
                  <option value="" disabled>Chọn chuyên khoa...</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#131b2e] mb-1">Loại phòng</label>
                  <select
                    className="w-full px-4 py-2 bg-white border border-[#c2c6d6] rounded-xl focus:ring-2 focus:ring-[#0058be] focus:border-transparent outline-none transition-all"
                    value={formData.wardType}
                    onChange={(e) => setFormData({ ...formData, wardType: e.target.value })}
                  >
                    <option value="GENERAL">Thường</option>
                    <option value="ICU">ICU</option>
                    <option value="EMERGENCY">Cấp cứu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#131b2e] mb-1">Tầng</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full px-4 py-2 bg-white border border-[#c2c6d6] rounded-xl focus:ring-2 focus:ring-[#0058be] focus:border-transparent outline-none transition-all"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  />
                </div>
              </div>

              {!editingWard && (
                <div>
                  <label className="block text-sm font-medium text-[#131b2e] mb-1">Số lượng giường tạo tự động</label>
                  <p className="text-xs text-[#54647a] mb-2">Hệ thống sẽ tự động tạo giường (VD: P.301-B01, P.301-B02)</p>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    className="w-full px-4 py-2 bg-[#f2f3ff] border border-[#c2c6d6] rounded-xl focus:ring-2 focus:ring-[#0058be] focus:border-transparent outline-none transition-all"
                    value={formData.numberOfBeds}
                    onChange={(e) => setFormData({ ...formData, numberOfBeds: e.target.value })}
                  />
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-medium text-[#54647a] bg-[#f2f3ff] rounded-xl hover:bg-[#e2e7ff] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-[#0058be] rounded-xl hover:bg-[#004395] transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                  {editingWard ? "Lưu thay đổi" : "Tạo Phòng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
