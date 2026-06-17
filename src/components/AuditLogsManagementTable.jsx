import React, { useState, useEffect } from "react";
import { Search, Filter, History, Eye, User, FileText, Database } from "lucide-react";
import axiosCustom from "../config/axiosCustom";
import { toast } from "sonner";

export const AuditLogsManagementTable = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [tableFilter, setTableFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [tableFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axiosCustom.get("/AuditLogs", {
        params: { tableName: tableFilter === "ALL" ? null : tableFilter }
      });
      setLogs(res.data);
    } catch (error) {
      console.error("Lỗi khi tải lịch sử dữ liệu:", error);
      toast.error("Không thể tải lịch sử hệ thống");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  const filteredLogs = logs.filter((l) => {
    const matchSearch = l.recordId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (l.changedByUserName && l.changedByUserName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSearch;
  });

  const getActionColor = (action) => {
    switch (action) {
      case "Added":
        return "bg-green-100 text-green-700 border-green-200";
      case "Modified":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Deleted":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case "Added": return "THÊM MỚI";
      case "Modified": return "CẬP NHẬT";
      case "Deleted": return "XÓA";
      default: return action.toUpperCase();
    }
  };

  const getTableLabel = (table) => {
    switch (table) {
      case "MedicalRecords": return "Bệnh Án";
      case "WardOrders": return "Y Lệnh Buồng Bệnh";
      case "AdmissionRecords": return "Hồ Sơ Nhập Viện";
      default: return table;
    }
  };

  const formatJson = (jsonStr) => {
    if (!jsonStr) return "Không có dữ liệu";
    try {
      const obj = JSON.parse(jsonStr);
      return JSON.stringify(obj, null, 2);
    } catch {
      return jsonStr;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-[#0058be]" /> Quản lý Audit Logs
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi và truy vết mọi thay đổi dữ liệu quan trọng trong hệ thống bệnh viện.
          </p>
        </div>
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
            placeholder="Tìm kiếm theo ID Bản ghi, Người thay đổi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="appearance-none bg-[#faf8ff] border border-slate-200 text-slate-700 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
            >
              <option value="ALL">Tất cả bảng</option>
              <option value="MedicalRecords">Bệnh Án</option>
              <option value="WardOrders">Y Lệnh Buồng Bệnh</option>
              <option value="AdmissionRecords">Hồ Sơ Nhập Viện</option>
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0058be]"></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Database className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-2 text-sm font-semibold text-slate-900">Không tìm thấy nhật ký</h3>
          <p className="mt-1 text-sm text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-[#faf8ff]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Thời gian</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hành động</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bảng dữ liệu</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Người thực hiện</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID Bản ghi</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(log.changedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-slate-900">
                        <FileText className="w-4 h-4 mr-2 text-slate-400" />
                        {getTableLabel(log.tableName)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-700">
                        <User className="w-4 h-4 mr-2 text-slate-400" />
                        {log.changedByUserName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                      {log.recordId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleOpenModal(log)}
                        className="text-[#0058be] hover:text-[#004395] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal View Details */}
      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#faf8ff]">
              <h3 className="text-xl font-bold text-[#131b2e] flex items-center gap-2">
                Chi tiết thay đổi dữ liệu
                <span className={`ml-2 px-2.5 py-0.5 text-xs rounded-full border ${getActionColor(selectedLog.action)}`}>
                  {getActionLabel(selectedLog.action)}
                </span>
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-700">
                &times;
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Thời gian</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{formatDate(selectedLog.changedAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Người thực hiện</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{selectedLog.changedByUserName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Bảng</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{selectedLog.tableName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Record ID</p>
                  <p className="text-sm font-medium font-mono text-slate-900 mt-1">{selectedLog.recordId}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedLog.action !== "Added" && (
                  <div>
                    <h4 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span> Dữ liệu cũ (Trước khi đổi)
                    </h4>
                    <pre className="bg-[#f8f9fa] border border-slate-200 p-4 rounded-xl text-xs overflow-x-auto text-slate-700 font-mono">
                      {formatJson(selectedLog.oldValues)}
                    </pre>
                  </div>
                )}
                
                {selectedLog.action !== "Deleted" && (
                  <div className={selectedLog.action === "Added" ? "md:col-span-2" : ""}>
                    <h4 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Dữ liệu mới (Sau khi đổi)
                    </h4>
                    <pre className="bg-[#f8f9fa] border border-slate-200 p-4 rounded-xl text-xs overflow-x-auto text-slate-700 font-mono">
                      {formatJson(selectedLog.newValues)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-white">
              <button
                onClick={handleCloseModal}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#0058be] rounded-xl hover:bg-[#004395] transition-colors"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
