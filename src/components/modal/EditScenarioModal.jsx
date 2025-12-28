import { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  X,
  Edit2,
  Trash2,
  Plus,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export function EditScenarioModal({ isOpen, onClose, scenario, onSubmit }) {
  const [formData, setFormData] = useState(scenario || {});
  const [editingStep, setEditingStep] = useState(null);
  const [editingOption, setEditingOption] = useState(null);
  const [errors, setErrors] = useState({});
  const [nextNewOptionId, setNextNewOptionId] = useState(-1); // ← Counter

  const handleSaveStep = () => {
    if (!editingStep) return;
    if (!editingStep.title.trim()) {
      setErrors({ step: "Tiêu đề bước là bắt buộc" });
      return;
    }

    const updatedSteps = formData.scenarioSteps.map((s) =>
      s.id === editingStep.id ? editingStep : s
    );
    setFormData({ ...formData, scenarioSteps: updatedSteps });
    setEditingStep(null);
  };

  const handleDeleteStep = (id) => {
    setFormData({
      ...formData,
      scenarioSteps: formData.scenarioSteps.filter((s) => s.id !== id),
    });
  };

  const handleSaveOption = () => {
    if (!editingOption || !editingStep) return;
    if (!editingOption.text.trim()) {
      setErrors({ option: "Nội dung tùy chọn là bắt buộc" });
      return;
    }

    const updatedOptions = editingStep.options.map((o) =>
      o.id === editingOption.id ? editingOption : o
    );
    setEditingStep({ ...editingStep, options: updatedOptions });
    setEditingOption(null);
  };

  const handleDeleteOption = (optionId) => {
    if (!editingStep) return;
    setEditingStep({
      ...editingStep,
      options: editingStep.options.filter((o) => o.id !== optionId),
    });
  };

  const handleAddOption = () => {
    const optionKeys = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const nextIndex = editingStep.options.length;

    // ← Dùng counter, rồi giảm dần
    const newOption = {
      id: nextNewOptionId,
      optionKey: optionKeys[nextIndex] || `Opt${nextIndex + 1}`,
      text: "",
      isCorrect: false,
      scoreValue: 0,
      feedbackCorrect: "Chính xác! Đây là câu trả lời đúng.",
      feedbackIncorrect: "Sai rồi, hãy thử lại.",
      endScenario: false,
    };

    setEditingStep({
      ...editingStep,
      options: [...editingStep.options, newOption],
    });

    // ← Giảm dần: -1 → -2 → -3 ...
    setNextNewOptionId(nextNewOptionId - 1);
  };

  const handleSubmit = () => {
    const processedSteps =
      formData.scenarioSteps?.map((step) => ({
        ...step,
        options:
          step.options?.map((opt) => ({
            ...opt,
            id: opt.id < 0 ? null : opt.id, // ← ID âm → null
            isNew: opt.id < 0 ? true : false, // ← ID < 0 là mới
          })) || [],
      })) || [];

    const dataToSubmit = {
      ...formData,
      scenarioSteps: processedSteps,
    };

    console.log("Data gửi lên backend:", dataToSubmit);
    onSubmit(dataToSubmit);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-4xl my-8 rounded-lg shadow-xl border">
        <div className="flex flex-row items-center justify-between p-6 pb-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Sửa Scenario</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full rounded-none border-b border-border bg-muted p-0">
              <TabsTrigger value="info" className="rounded-none">
                Thông tin Scenario
              </TabsTrigger>
              <TabsTrigger value="steps" className="rounded-none">
                Quản lý bước
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="info" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tên Scenario
                  </label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-muted border-border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tiêu đề
                  </label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="bg-muted border-border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mô tả
                  </label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="bg-muted border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Loại
                    </label>
                    <Select
                      value={formData.type || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger className="bg-muted border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="outdoor">Ngoài trời</SelectItem>
                        <SelectItem value="indoor">Trong nhà</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Độ khó
                    </label>
                    <Select
                      value={formData.difficulty || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, difficulty: value })
                      }
                    >
                      <SelectTrigger className="bg-muted border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dễ">Dễ</SelectItem>
                        <SelectItem value="Trung Bình">Trung bình</SelectItem>
                        <SelectItem value="Khó">Khó</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Thời lượng (phút)
                    </label>
                    <Input
                      type="number"
                      value={formData.duration || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: parseInt(e.target.value) || 0,
                        })
                      }
                      className="bg-muted border-border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Điểm vượt qua (%)
                    </label>
                    <Input
                      type="number"
                      value={formData.passingScore || 70}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passingScore: parseInt(e.target.value) || 70,
                        })
                      }
                      className="bg-muted border-border"
                    />
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
              </TabsContent>

              <TabsContent value="steps" className="space-y-4">
                {editingStep ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Chỉnh sửa bước: {editingStep.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Loại bước
                          </label>
                          <Select
                            value={editingStep.stepType}
                            onValueChange={(value) =>
                              setEditingStep({
                                ...editingStep,
                                stepType: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-muted border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="information">
                                Thông tin
                              </SelectItem>
                              <SelectItem value="question">Câu hỏi</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Tiêu đề
                          </label>
                          <Input
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
                                  Chưa có tùy chọn nào.
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
                                        setEditingStep({
                                          ...editingStep,
                                          options: editingStep.options.filter(
                                            (o) => o.id !== opt.id
                                          ),
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
                                    id: nextNewOptionId,
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
                                    options: [
                                      ...editingStep.options,
                                      newOption,
                                    ],
                                  });
                                  setNextNewOptionId(nextNewOptionId - 1);
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
                                                  ? {
                                                      ...o,
                                                      text: e.target.value,
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
                                          checked={opt.isCorrect}
                                          onChange={(e) => {
                                            const updatedOptions =
                                              editingStep.options.map((o) =>
                                                o.id === opt.id
                                                  ? {
                                                      ...o,
                                                      isCorrect:
                                                        e.target.checked,
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
                                                        parseInt(
                                                          e.target.value
                                                        ) || 0,
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
                                                      endScenario:
                                                        e.target.checked,
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
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {formData.scenarioSteps?.map((step, index) => (
                      <div
                        key={step.id}
                        className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            Bước {index + 1}: {step.title}
                          </p>
                          <p className="text-sm text-foreground/60">
                            {step.stepType === "information"
                              ? "Thông tin"
                              : "Câu hỏi"}
                            {step.options.length > 0 &&
                              ` • ${step.options.length} tùy chọn`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setEditingStep(step)}
                            size="sm"
                            className="bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Sửa
                          </Button>

                          <Button
                            onClick={() => handleDeleteStep(step.id)}
                            size="sm"
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>

          {/* Nút hành động */}
          <div className="flex gap-3 justify-end border-t pt-6 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary/90"
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
