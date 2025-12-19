import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import {
  Edit2,
  Heart,
  Flame,
  Droplet,
  Brain,
  Bone,
  Biohazard,
  Sun,
  Activity,
  BeanOff,
} from "lucide-react";

const ICON_OPTIONS = [
  { name: "Heart", icon: Heart, label: "Trái tim" },
  { name: "Flame", icon: Flame, label: "Lửa" },
  { name: "Droplet", icon: Droplet, label: "Giọt" },
  { name: "Brain", icon: Brain, label: "Não" },
  { name: "Bone", icon: Bone, label: "Xương" },
  { name: "Biohazard", icon: Biohazard, label: "Sinh học Nguy hiểm" },
  { name: "Sun", icon: Sun, label: "Mặt trời" },
  { name: "Activity", icon: Activity, label: "Hoạt động" },
  { name: "BeanOff", icon: BeanOff, label: "Tắt" },
];

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-2xl my-8 rounded-lg shadow-xl border">
        <div className="flex flex-row items-center justify-between p-6 pb-4 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Chỉnh sửa Khóa học Thực hành
            </h2>
            <p className="text-sm text-gray-500">Cập nhật thông tin khóa học</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
            aria-label="Đóng"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export function EditPracticalCourseModal({ course, onSubmit }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description,
    icon: course.icon || "",
    location: course.location,
    price: course.price,
    durationMinutes: course.durationMinutes,
    startDate: course.startDate,
    endDate: course.endDate,
    isPublished: course.isPublished,
    maxStudents: course.maxStudents,
    highlights: course.highlights || [""],
    requirements: course.requirements || [""],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData({
      title: course.title,
      description: course.description,
      icon: course.icon || "",
      location: course.location,
      price: course.price,
      durationMinutes: course.durationMinutes,
      startDate: course.startDate,
      endDate: course.endDate,
      isPublished: course.isPublished,
      maxStudents: course.maxStudents,
      highlights: course.highlights || [""],
      requirements: course.requirements || [""],
    });
  }, [course]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    } else if (formData.title.length > 200) {
      newErrors.title = "Tiêu đề không được vượt quá 200 ký tự";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Mô tả là bắt buộc";
    } else if (formData.description.length > 1000) {
      newErrors.description = "Mô tả không được vượt quá 1000 ký tự";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Địa điểm là bắt buộc";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Giá phải lớn hơn 0";
    }

    if (!formData.durationMinutes || parseInt(formData.durationMinutes) <= 0) {
      newErrors.durationMinutes = "Thời lượng phải lớn hơn 0";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Ngày bắt đầu là bắt buộc";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Ngày kết thúc là bắt buộc";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    if (!formData.maxStudents || parseInt(formData.maxStudents) <= 0) {
      newErrors.maxStudents = "Số học sinh tối đa phải lớn hơn 0";
    }

    const filteredHighlights = formData.highlights.filter((h) => h.trim());
    if (filteredHighlights.length === 0) {
      newErrors.highlights = "Phải có ít nhất một điểm nổi bật";
    }

    const filteredRequirements = formData.requirements.filter((r) => r.trim());
    if (filteredRequirements.length === 0) {
      newErrors.requirements = "Phải có ít nhất một yêu cầu";
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = {
      title: formData.title,
      description: formData.description,
      icon: formData.icon || null,
      location: formData.location,
      price: parseFloat(formData.price),
      durationMinutes: parseInt(formData.durationMinutes),
      startDate: formData.startDate,
      endDate: formData.endDate,
      isPublished: formData.isPublished,
      maxStudents: parseInt(formData.maxStudents),
      highlights: formData.highlights.filter((h) => h.trim()),
      requirements: formData.requirements.filter((r) => r.trim()),
    };

    onSubmit(course.id, submitData);
    setErrors({});
    setOpen(false);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData((prev) => ({
      ...prev,
      [field]: newArray,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      const newArray = formData[field].filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        [field]: newArray,
      }));
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1 text-blue-600 hover:bg-blue-50 bg-transparent"
        onClick={() => setOpen(true)}
      >
        <Edit2 className="w-4 h-4" />
        Sửa
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        {/* Tiêu đề */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Nhập tiêu đề khóa học"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? "border-red-500" : "border-border"
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Mô tả <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Nhập mô tả chi tiết về khóa học"
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.description ? "border-red-500" : "border-border"
            }`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Địa điểm và Icon */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Địa điểm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="VD: Thành Phố Hồ Chí Minh"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.location ? "border-red-500" : "border-border"
              }`}
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-foreground mb-3">
              Biểu tượng Icon
            </label>
            <div className="grid grid-cols-3 gap-3">
              {ICON_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.name}
                    onClick={() => handleChange("icon", option.name)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      formData.icon === option.name
                        ? "border-blue-500 bg-blue-50"
                        : "border-border hover:border-blue-300"
                    }`}
                    type="button"
                  >
                    <IconComponent className="w-6 h-6" />
                    {/* <span className="text-xs text-center text-foreground font-medium">
                        {option.label}
                      </span> */}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Giá và Thời lượng */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Giá (VND) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
              placeholder="450000"
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.price ? "border-red-500" : "border-border"
              }`}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Thời lượng (phút) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.durationMinutes}
              onChange={(e) => handleChange("durationMinutes", e.target.value)}
              placeholder="180"
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.durationMinutes ? "border-red-500" : "border-border"
              }`}
            />
            {errors.durationMinutes && (
              <p className="text-red-500 text-sm mt-1">
                {errors.durationMinutes}
              </p>
            )}
          </div>
        </div>

        {/* Ngày bắt đầu và Ngày kết thúc */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Ngày bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.startDate ? "border-red-500" : "border-border"
              }`}
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Ngày kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.endDate ? "border-red-500" : "border-border"
              }`}
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Số học sinh tối đa */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Số học sinh tối đa <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.maxStudents}
            onChange={(e) => handleChange("maxStudents", e.target.value)}
            placeholder="100"
            min="1"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.maxStudents ? "border-red-500" : "border-border"
            }`}
          />
          {errors.maxStudents && (
            <p className="text-red-500 text-sm mt-1">{errors.maxStudents}</p>
          )}
        </div>

        {/* Điểm Nổi Bật */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Điểm Nổi Bật <span className="text-red-500">*</span>
          </label>
          {formData.highlights.map((highlight, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={highlight}
                onChange={(e) =>
                  handleArrayChange("highlights", index, e.target.value)
                }
                placeholder={`Điểm nổi bật ${index + 1}`}
                className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => removeArrayItem("highlights", index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                Xóa
              </button>
            </div>
          ))}
          <button
            onClick={() => addArrayItem("highlights")}
            className="text-blue-600 hover:underline text-sm"
          >
            + Thêm điểm nổi bật
          </button>
          {errors.highlights && (
            <p className="text-red-500 text-sm mt-1">{errors.highlights}</p>
          )}
        </div>

        {/* Yêu Cầu */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Yêu Cầu <span className="text-red-500">*</span>
          </label>
          {formData.requirements.map((requirement, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={requirement}
                onChange={(e) =>
                  handleArrayChange("requirements", index, e.target.value)
                }
                placeholder={`Yêu cầu ${index + 1}`}
                className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => removeArrayItem("requirements", index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                Xóa
              </button>
            </div>
          ))}
          <button
            onClick={() => addArrayItem("requirements")}
            className="text-blue-600 hover:underline text-sm"
          >
            + Thêm yêu cầu
          </button>
          {errors.requirements && (
            <p className="text-red-500 text-sm mt-1">{errors.requirements}</p>
          )}
        </div>

        {/* Trạng thái công bố */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isPublished"
            checked={formData.isPublished}
            onChange={(e) => handleChange("isPublished", e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <label
            htmlFor="isPublished"
            className="text-sm font-medium text-foreground cursor-pointer"
          >
            Công bố khóa học
          </label>
        </div>

        {/* Nút hành động */}
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Cập nhật Khóa học</Button>
        </div>
      </Modal>
    </>
  );
}

EditPracticalCourseModal.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.string,
    location: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    durationMinutes: PropTypes.number.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    isPublished: PropTypes.bool.isRequired,
    maxStudents: PropTypes.number.isRequired,
    highlights: PropTypes.array,
    requirements: PropTypes.array,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
};
