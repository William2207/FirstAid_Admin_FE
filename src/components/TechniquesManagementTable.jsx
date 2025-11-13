import React, { useState, useEffect } from "react";
import { CreateTechniqueModal } from "./modal/CreateTechniqueModal";
import { EditTechniqueModal } from "./modal/EditTechniqueModal";
import axiosCustom from "@/config/axiosCustom";

export function TechniquesManagementTable() {
  const [techniques, setTechniques] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTechnique, setCurrentTechnique] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    const fetchTechniques = async () => {
      try {
        // Endpoint là '/techniques' vì baseURL đã được cấu hình là '.../api'
        const response = await axiosCustom.get("/techniques?pageSize=200");
        setTechniques(response.data.data);
      } catch (error) {
        // Interceptor của bạn đã log lỗi ra console, ở đây bạn có thể hiển thị thông báo cho người dùng nếu cần
        console.error("Không thể tải danh sách kỹ thuật:", error);
      }
    };

    fetchTechniques();
  }, []);

  const handleDelete = async (id) => {
    const originalTechniques = [...techniques];

    // Cập nhật giao diện ngay lập tức để tăng trải nghiệm người dùng
    setTechniques(techniques.filter((t) => t.id !== id));

    try {
      // Gọi API DELETE
      await axiosCustom.delete(`/techniques/${id}`);
    } catch (error) {
      console.error("Lỗi khi xóa kỹ thuật:", error);
      // Nếu có lỗi, khôi phục lại danh sách ban đầu
      setTechniques(originalTechniques);
      alert("Xóa kỹ thuật thất bại, vui lòng thử lại.");
    }
  };

  /**
   * Hàm trợ giúp để upload một file lên API Cloudinary của bạn.
   * @param {File} file - Đối tượng file cần upload.
   * @returns {Promise<string|null>} - Trả về URL của file đã upload hoặc null nếu có lỗi.
   */
  const uploadFile = async (file) => {
    if (!file) return null;
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const response = await axiosCustom.post("/media/upload", uploadFormData);
      // Giả sử API trả về object có chứa URL: { success: true, url: '...' }
      return response.data.url;
    } catch (error) {
      console.error("Lỗi khi upload file:", error);
      // Ném lỗi ra ngoài để Promise.all có thể bắt được
      throw new Error(`Upload file ${file.name} thất bại.`);
    }
  };

  /**
   * Hàm xử lý việc thêm kỹ thuật mới bằng cách gọi API qua axiosCustom.
   * @param {object} formData Dữ liệu từ form trong modal.
   */
  const handleAddTechnique = async (formData) => {
    setIsSubmitting(true);
    console.log("Dữ liệu gửi lên API:", formData);

    try {
      console.log("Bắt đầu quá trình upload file...");

      // Tạo một mảng các promise để upload file
      const uploadPromises = [];

      // Thêm promise cho video và ảnh đại diện (nếu có)
      if (formData.videoFile)
        uploadPromises.push(uploadFile(formData.videoFile));
      if (formData.imageFile)
        uploadPromises.push(uploadFile(formData.imageFile));

      // Thêm promise cho ảnh của từng bước (nếu có)
      formData.steps.forEach((step) => {
        if (step.imageFile) {
          uploadPromises.push(uploadFile(step.imageFile));
        }
      });

      // Chờ tất cả các file được upload xong
      const uploadedUrls = await Promise.all(uploadPromises);
      console.log("Tất cả các file đã được upload:", uploadedUrls);

      // Sao chép dữ liệu từ form để không thay đổi state gốc
      const payload = { ...formData };
      let urlIndex = 0; // Sử dụng index để lấy URL theo đúng thứ tự

      // Gán URL cho video và ảnh đại diện
      if (payload.videoFile) {
        payload.videoUrl = uploadedUrls[urlIndex++];
        delete payload.videoFile; // Xóa key chứa đối tượng File
      }
      if (payload.imageFile) {
        payload.imageUrl = uploadedUrls[urlIndex++];
        delete payload.imageFile; // Xóa key chứa đối tượng File
      }

      // Gán URL cho ảnh của từng bước
      payload.steps = payload.steps.map((step) => {
        if (step.imageFile) {
          const newStep = { ...step, imageUrl: uploadedUrls[urlIndex++] };
          delete newStep.imageFile;
          return newStep;
        }
        // Nếu không có imageFile thì set imageUrl = null
        const newStep = { ...step, imageUrl: null };
        delete newStep.imageFile;
        return newStep;
      });

      console.log("Payload cuối cùng sẽ được gửi đi:", payload);

      // --- BƯỚC 3: Gửi payload hoàn chỉnh đến API tạo technique ---
      const response = await axiosCustom.post("/techniques", payload);
      // const newTechniqueFromServer = response.data;
      // console.log("NEW TECHNIQUE", newTechniqueFromServer);
      // setTechniques([newTechniqueFromServer, ...techniques]);
      const responseData = await axiosCustom.get("/techniques?pageSize=200");
      setTechniques(responseData.data.data);
      setShowAddModal(false);
    } catch (error) {
      // Interceptor của bạn đã log lỗi chi tiết ra console.
      // Ở đây, chúng ta chỉ cần hiển thị một thông báo thân thiện cho người dùng.
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi tạo kỹ thuật mới.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false); // Luôn dừng trạng thái loading dù thành công hay thất bại
    }
  };

  const handleOpenEditModal = async (technique) => {
    setIsLoadingDetail(true);
    try {
      // Gọi API lấy chi tiết technique theo ID
      const response = await axiosCustom.get(`/techniques/${technique.id}`);
      const detailedTechnique = response.data;

      // Lưu dữ liệu chi tiết vào state
      setCurrentTechnique(detailedTechnique);
      setShowEditModal(true); // Mở modal sau khi đã có dữ liệu
    } catch (error) {
      console.error("Lỗi khi tải chi tiết kỹ thuật:", error);
      alert("Không thể tải thông tin kỹ thuật. Vui lòng thử lại.");
    } finally {
      setIsLoadingDetail(false);
    }
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCurrentTechnique(null); // Dọn dẹp state khi đóng
  };

  const handleUpdateTechnique = async (formData) => {
    if (!currentTechnique) return;

    // Lưu ý: Logic upload file khi sửa chưa được thêm vào.
    // Nếu bạn muốn cho phép thay đổi ảnh/video khi sửa, bạn cần thêm logic tương tự
    // như trong hàm `handleAddTechnique`.
    // Dưới đây là logic cập nhật thông tin văn bản.

    setIsSubmitting(true);
    try {
      // Gọi API PUT để cập nhật, endpoint thường là /techniques/{id}
      await axiosCustom.put(`/techniques/${currentTechnique.id}`, formData);

      // Cập nhật lại danh sách trên giao diện
      // Cách đơn giản nhất là gọi lại API để lấy danh sách mới
      const response = await axiosCustom.get("/techniques?pageSize=200");
      setTechniques(response.data.data);

      handleCloseEditModal(); // Đóng modal sau khi thành công
    } catch (error) {
      console.error("Lỗi khi cập nhật kỹ thuật:", error);
      alert("Cập nhật kỹ thuật thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Quản lý kỹ thuật sơ cứu
          </h1>
          <p className="text-gray-500 mt-2">
            Quản lý toàn bộ kỹ thuật sơ cứu trong hệ thống
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {/* Icon Plus */}
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
          Thêm kỹ thuật
        </button>
      </div>

      <div className="border rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold">Danh sách kỹ thuật</h2>
          <p className="text-gray-600">
            Tổng cộng {techniques.length} kỹ thuật
          </p>
        </div>
        <div className="p-6 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Tên kỹ thuật
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Danh mục
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Độ khó
                  </th>

                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {techniques.map((technique) => (
                  <tr key={technique.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{technique.title}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {technique.type.name}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          technique.difficulty === "Dễ"
                            ? "bg-green-100 text-green-800"
                            : technique.difficulty === "Trung Bình"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {technique.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => handleOpenEditModal(technique)}
                        disabled={isLoadingDetail}
                        className="flex items-center gap-1 px-3 py-1 border rounded-md hover:bg-gray-100"
                      >
                        {isLoadingDetail ? "Đang tải..." : "Sửa"}
                      </button>
                      <button
                        onClick={() => handleDelete(technique.id)}
                        className="flex items-center gap-1 px-3 py-1 border rounded-md text-red-600 hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Component modal được gọi ở đây */}
      {showAddModal && (
        <CreateTechniqueModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddTechnique}
          isSubmitting={isSubmitting} // Truyền trạng thái isSubmitting vào modal
        />
      )}

      {showEditModal && currentTechnique && (
        <EditTechniqueModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSubmit={handleUpdateTechnique}
          techniqueData={currentTechnique} // Truyền dữ liệu của kỹ thuật đang được sửa vào modal
        />
      )}
    </div>
  );
}
