import { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Trash2 } from "lucide-react";
import {
  Heart,
  Flame,
  Droplet,
  Brain,
  Bone,
  Biohazard,
  Sun,
  Activity,
  BeanOff,
  ThermometerSnowflake,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  { name: "ThermometerSnowflake", icon: ThermometerSnowflake, label: "Lạnh" },
];

export function CreateScenarioModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    type: "",
    difficulty: "",
    duration: 30,
    icon: "",
    passingScore: 70,
    isPublished: true,
  });

  const [steps, setSteps] = useState([]);
  const [editingStep, setEditingStep] = useState(null);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Tên scenario là bắt buộc";
    if (!formData.title.trim()) newErrors.title = "Tiêu đề là bắt buộc";
    if (!formData.type) newErrors.type = "Loại scenario là bắt buộc";
    if (!formData.difficulty) newErrors.difficulty = "Độ khó là bắt buộc";
    if (formData.duration < 1) newErrors.duration = "Thời lượng phải lớn hơn 0";
    if (formData.passingScore < 0 || formData.passingScore > 100)
      newErrors.passingScore = "Điểm vượt qua phải từ 0-100";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddStep = () => {
    const newStep = {
      id: `step-${Date.now()}`,
      stepType: "information",
      title: "",
      description: "",
      question: "",
      imageUrl: "",
      videoUrl: "",
      timeLimit: 0,
      maxScore: 10,
      options: [],
    };
    setEditingStep(newStep);
  };

  const handleSaveStep = () => {
    if (!editingStep) return;

    if (!editingStep.title.trim()) {
      setErrors({ step: "Tiêu đề bước là bắt buộc" });
      return;
    }

    if (
      editingStep.stepType === "question" &&
      editingStep.options.length === 0
    ) {
      setErrors({ step: "Bước câu hỏi phải có ít nhất 1 tùy chọn" });
      return;
    }

    const existingIndex = steps.findIndex((s) => s.id === editingStep.id);
    if (existingIndex >= 0) {
      const updatedSteps = [...steps];
      updatedSteps[existingIndex] = editingStep;
      setSteps(updatedSteps);
    } else {
      setSteps([...steps, editingStep]);
    }
    setEditingStep(null);
    setErrors({});
  };

  const handleDeleteStep = (id) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      scenarioSteps: steps,
    };

    onSubmit(submitData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-4xl my-8 rounded-lg shadow-xl border">
        <div className="flex flex-row items-center justify-between p-6 pb-4 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Tạo Scenario
            </h2>
            <p className="text-sm text-gray-500">
              Thêm một scenario mới vào hệ thống
            </p>
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
          {/* Thông tin cơ bản */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tên Scenario *
                </label>
                <Input
                  placeholder="Nhập tên scenario"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-muted border-border"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tiêu đề *
                </label>
                <Input
                  placeholder="Nhập tiêu đề scenario"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="bg-muted border-border"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mô tả
                </label>
                <Textarea
                  placeholder="Nhập mô tả scenario"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-muted border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Loại *
                  </label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outdoor">Ngoài trời</SelectItem>
                      <SelectItem value="indoor">Trong nhà</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-xs mt-1">{errors.type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Độ khó *
                  </label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      setFormData({ ...formData, difficulty: value })
                    }
                  >
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue placeholder="Chọn độ khó" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dễ">Dễ</SelectItem>
                      <SelectItem value="Trung Bình">Trung bình</SelectItem>
                      <SelectItem value="Khó">Khó</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.difficulty && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.difficulty}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Thời lượng (phút) *
                  </label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    className="bg-muted border-border"
                  />
                  {errors.duration && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.duration}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Điểm vượt qua (%)
                  </label>
                  <Input
                    type="number"
                    placeholder="70"
                    value={formData.passingScore}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passingScore: parseInt(e.target.value) || 70,
                      })
                    }
                    className="bg-muted border-border"
                  />
                  {errors.passingScore && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.passingScore}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Biểu tượng Icon
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {ICON_OPTIONS.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.name}
                        onClick={() =>
                          setFormData({ ...formData, icon: option.name })
                        }
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label
                  htmlFor="isPublished"
                  className="text-sm text-foreground"
                >
                  Xuất bản ngay
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Quản lý bước */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-lg">Bước Scenario</CardTitle>
              <Button
                onClick={handleAddStep}
                size="sm"
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                Thêm bước
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingStep ? (
                <div className="border border-primary/30 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-foreground">
                    {editingStep.id.includes("step-")
                      ? "Bước mới"
                      : `Chỉnh sửa ${editingStep.title}`}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Loại bước *
                      </label>
                      <Select
                        value={editingStep.stepType}
                        onValueChange={(value) =>
                          setEditingStep({ ...editingStep, stepType: value })
                        }
                      >
                        <SelectTrigger className="bg-muted border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="information">Thông tin</SelectItem>
                          <SelectItem value="question">Câu hỏi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Tiêu đề *
                      </label>
                      <Input
                        placeholder="Tiêu đề bước"
                        value={editingStep.title}
                        onChange={(e) =>
                          setEditingStep({
                            ...editingStep,
                            title: e.target.value,
                          })
                        }
                        className="bg-muted border-border"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Mô tả
                    </label>
                    <Textarea
                      placeholder="Mô tả bước"
                      value={editingStep.description}
                      onChange={(e) =>
                        setEditingStep({
                          ...editingStep,
                          description: e.target.value,
                        })
                      }
                      className="bg-muted border-border"
                    />
                  </div>

                  {editingStep.stepType === "question" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Câu hỏi
                        </label>
                        <Textarea
                          placeholder="Câu hỏi cho bước này"
                          value={editingStep.question}
                          onChange={(e) =>
                            setEditingStep({
                              ...editingStep,
                              question: e.target.value,
                            })
                          }
                          className="bg-muted border-border"
                        />
                      </div>

                      <Card className="bg-muted/50">
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Tùy chọn trả lời
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {editingStep.options.length === 0 ? (
                            <p className="text-foreground/60 text-sm text-center py-4">
                              Chưa có tùy chọn nào. Nhấn "Lưu bước" để bắt đầu
                              thêm.
                            </p>
                          ) : (
                            editingStep.options.map((opt, optIndex) => (
                              <div
                                key={opt.id}
                                className="flex justify-between items-center p-2 bg-background rounded border border-border"
                              >
                                <div>
                                  <p className="font-medium text-foreground">
                                    {opt.optionKey}:{" "}
                                    {opt.text || "(chưa có nội dung)"}
                                  </p>
                                  {opt.isCorrect && (
                                    <p className="text-xs text-green-600">
                                      ✓ Câu trả lời đúng
                                    </p>
                                  )}
                                  {opt.endScenario && (
                                    <p className="text-xs text-blue-600">
                                      • Kết thúc scenario
                                    </p>
                                  )}
                                </div>
                                <Button
                                  onClick={() => {
                                    const updatedOptions =
                                      editingStep.options.filter(
                                        (o) => o.id !== opt.id
                                      );
                                    setEditingStep({
                                      ...editingStep,
                                      options: updatedOptions,
                                    });
                                  }}
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))
                          )}
                          <Button
                            onClick={() => {
                              const optionKeys = [
                                "A",
                                "B",
                                "C",
                                "D",
                                "E",
                                "F",
                                "G",
                                "H",
                              ];
                              const nextIndex = editingStep.options.length;
                              const newOption = {
                                id: `opt-${Date.now()}`,
                                optionKey:
                                  optionKeys[nextIndex] ||
                                  `Opt${nextIndex + 1}`,
                                text: "",
                                isCorrect: false,
                                scoreValue: 0,
                                feedbackCorrect:
                                  "Chính xác! Đây là câu trả lời đúng.",
                                feedbackIncorrect: "Sai rồi, hãy thử lại.",
                                endScenario: false,
                              };
                              setEditingStep({
                                ...editingStep,
                                options: [...editingStep.options, newOption],
                              });
                            }}
                            size="sm"
                            variant="outline"
                            className="w-full gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Thêm Tùy Chọn
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-muted/50">
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Chi Tiết Tùy Chọn
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {editingStep.options.length === 0 ? (
                            <p className="text-foreground/60 text-sm text-center py-4">
                              Thêm tùy chọn để chỉnh sửa chi tiết
                            </p>
                          ) : (
                            <div className="space-y-4">
                              {editingStep.options.map((opt, optIndex) => (
                                <div
                                  key={opt.id}
                                  className="p-3 bg-background rounded-lg border border-border space-y-3"
                                >
                                  <h4 className="font-medium text-foreground">
                                    Tùy chọn {opt.optionKey}
                                  </h4>

                                  <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                      Khóa tùy chọn
                                    </label>
                                    <Input
                                      value={opt.optionKey}
                                      onChange={(e) => {
                                        const updatedOptions =
                                          editingStep.options.map((o) =>
                                            o.id === opt.id
                                              ? {
                                                  ...o,
                                                  optionKey:
                                                    e.target.value.toUpperCase(),
                                                }
                                              : o
                                          );
                                        setEditingStep({
                                          ...editingStep,
                                          options: updatedOptions,
                                        });
                                      }}
                                      className="bg-muted border-border"
                                      placeholder="A, B, C..."
                                      maxLength="2"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                      Nội dung
                                    </label>
                                    <Textarea
                                      placeholder={`Nội dung tùy chọn ${opt.optionKey}`}
                                      value={opt.text}
                                      onChange={(e) => {
                                        const updatedOptions =
                                          editingStep.options.map((o) =>
                                            o.id === opt.id
                                              ? { ...o, text: e.target.value }
                                              : o
                                          );
                                        setEditingStep({
                                          ...editingStep,
                                          options: updatedOptions,
                                        });
                                      }}
                                      className="bg-muted border-border"
                                    />
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={opt.isCorrect}
                                      onChange={(e) => {
                                        const updatedOptions =
                                          editingStep.options.map((o) =>
                                            o.id === opt.id
                                              ? {
                                                  ...o,
                                                  isCorrect: e.target.checked,
                                                }
                                              : o
                                          );
                                        setEditingStep({
                                          ...editingStep,
                                          options: updatedOptions,
                                        });
                                      }}
                                      className="w-4 h-4"
                                    />
                                    <label className="text-sm text-foreground">
                                      Câu trả lời đúng
                                    </label>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                      Điểm
                                    </label>
                                    <Input
                                      type="number"
                                      value={opt.scoreValue}
                                      onChange={(e) => {
                                        const updatedOptions =
                                          editingStep.options.map((o) =>
                                            o.id === opt.id
                                              ? {
                                                  ...o,
                                                  scoreValue:
                                                    parseInt(e.target.value) ||
                                                    0,
                                                }
                                              : o
                                          );
                                        setEditingStep({
                                          ...editingStep,
                                          options: updatedOptions,
                                        });
                                      }}
                                      className="bg-muted border-border"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                      Phản hồi đúng
                                    </label>
                                    <Textarea
                                      placeholder="Phản hồi khi chọn đúng"
                                      value={opt.feedbackCorrect}
                                      onChange={(e) => {
                                        const updatedOptions =
                                          editingStep.options.map((o) =>
                                            o.id === opt.id
                                              ? {
                                                  ...o,
                                                  feedbackCorrect:
                                                    e.target.value,
                                                }
                                              : o
                                          );
                                        setEditingStep({
                                          ...editingStep,
                                          options: updatedOptions,
                                        });
                                      }}
                                      className="bg-muted border-border"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                      Phản hồi sai
                                    </label>
                                    <Textarea
                                      placeholder="Phản hồi khi chọn sai"
                                      value={opt.feedbackIncorrect}
                                      onChange={(e) => {
                                        const updatedOptions =
                                          editingStep.options.map((o) =>
                                            o.id === opt.id
                                              ? {
                                                  ...o,
                                                  feedbackIncorrect:
                                                    e.target.value,
                                                }
                                              : o
                                          );
                                        setEditingStep({
                                          ...editingStep,
                                          options: updatedOptions,
                                        });
                                      }}
                                      className="bg-muted border-border"
                                    />
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={opt.endScenario}
                                      onChange={(e) => {
                                        const updatedOptions =
                                          editingStep.options.map((o) =>
                                            o.id === opt.id
                                              ? {
                                                  ...o,
                                                  endScenario: e.target.checked,
                                                }
                                              : o
                                          );
                                        setEditingStep({
                                          ...editingStep,
                                          options: updatedOptions,
                                        });
                                      }}
                                      className="w-4 h-4"
                                    />
                                    <label className="text-sm text-foreground">
                                      Kết thúc scenario
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Giới hạn thời gian (giây)
                      </label>
                      <Input
                        type="number"
                        value={editingStep.timeLimit}
                        onChange={(e) =>
                          setEditingStep({
                            ...editingStep,
                            timeLimit: parseInt(e.target.value) || 0,
                          })
                        }
                        className="bg-muted border-border"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Điểm tối đa
                      </label>
                      <Input
                        type="number"
                        value={editingStep.maxScore}
                        onChange={(e) =>
                          setEditingStep({
                            ...editingStep,
                            maxScore: parseInt(e.target.value) || 10,
                          })
                        }
                        className="bg-muted border-border"
                      />
                    </div>
                  </div>

                  {/*
<div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium text-foreground mb-2">
      URL ảnh
    </label>
    <Input
      placeholder="https://example.com/image.jpg"
      value={editingStep.imageUrl}
      onChange={(e) =>
        setEditingStep({
          ...editingStep,
          imageUrl: e.target.value,
        })
      }
      className="bg-muted border-border"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-foreground mb-2">
      URL video
    </label>
    <Input
      placeholder="https://example.com/video.mp4"
      value={editingStep.videoUrl}
      onChange={(e) =>
        setEditingStep({
          ...editingStep,
          videoUrl: e.target.value,
        })
      }
      className="bg-muted border-border"
    />
  </div>
</div>
*/}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveStep}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Lưu bước
                    </Button>
                    <Button
                      onClick={() => setEditingStep(null)}
                      variant="outline"
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {steps.length === 0 ? (
                    <p className="text-foreground/60 text-center py-4">
                      Chưa có bước nào. Nhấn "Thêm bước" để bắt đầu.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {steps.map((step, index) => (
                        <div
                          key={step.id}
                          className="flex justify-between items-center p-3 bg-muted rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              Bước {index + 1}: {step.title}
                            </p>
                            <p className="text-sm text-foreground/60">
                              {step.stepType === "information"
                                ? "Thông tin"
                                : "Câu hỏi"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setEditingStep(step)}
                              size="sm"
                              variant="outline"
                            >
                              Sửa
                            </Button>
                            <Button
                              onClick={() => handleDeleteStep(step.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {errors.step && <p className="text-red-500 text-sm">{errors.step}</p>}

          {/* Nút hành động */}
          <div className="flex gap-3 justify-end border-t pt-6 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary/90"
            >
              Tạo Scenario
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
