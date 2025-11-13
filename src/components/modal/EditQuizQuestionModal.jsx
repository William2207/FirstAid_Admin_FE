import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import axiosCustom from "@/config/axiosCustom";

export function EditQuizQuestionModal({
  open,
  onOpenChange,
  question,
  onUpdate,
}) {
  const [techniqueId, setTechniqueId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [answerOptions, setAnswerOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [techniques, setTechniques] = useState([]);

  //fetch techniques from API
  useEffect(() => {
    const fetchTechniques = async () => {
      try {
        const response = await axiosCustom.get("/techniques?pageSize=200");
        setTechniques(response.data.data);
      } catch (err) {
        console.error("Error fetching techniques:", err);
      }
    };
    fetchTechniques();
  }, []);
  useEffect(() => {
    if (question) {
      setTechniqueId(question.techniqueId);
      setQuestionText(question.questionText);
      setDifficulty(question.difficulty);
      setAnswerOptions(question.answerOptions || []);
    }
  }, [question, open]);

  const validateForm = () => {
    const newErrors = {};

    if (!techniqueId) newErrors.techniqueId = "Vui lòng chọn kỹ thuật";
    if (
      !questionText ||
      questionText.length < 10 ||
      questionText.length > 500
    ) {
      newErrors.questionText = "Câu hỏi phải từ 10-500 ký tự";
    }
    if (!difficulty) newErrors.difficulty = "Vui lòng chọn độ khó";
    if (answerOptions.some((opt) => !opt.answerText)) {
      newErrors.answerOptions = "Tất cả tùy chọn phải có nội dung";
    }
    if (!answerOptions.some((opt) => opt.isCorrect)) {
      newErrors.correctAnswer = "Phải có ít nhất 1 tùy chọn đúng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddOption = () => {
    setAnswerOptions([...answerOptions, { answerText: "", isCorrect: false }]);
  };

  const handleRemoveOption = (index) => {
    if (answerOptions.length > 2) {
      setAnswerOptions(answerOptions.filter((_, i) => i !== index));
    }
  };

  const handleUpdateOption = (index, field, value) => {
    const newOptions = [...answerOptions];
    if (field === "answerText") {
      newOptions[index].answerText = value;
    } else if (field === "isCorrect") {
      newOptions[index].isCorrect = value;
    }
    setAnswerOptions(newOptions);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const selectedTechnique = techniques.find((t) => t.id === techniqueId);
      onUpdate({
        ...question,
        techniqueId,
        techniqueName: selectedTechnique?.title,
        questionText,
        difficulty,
        answerOptions,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sửa Câu Hỏi Quiz</DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin câu hỏi quiz
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="technique">Kỹ Thuật *</Label>
            <Select value={techniqueId} onValueChange={setTechniqueId} disabled>
              <SelectTrigger>
                <SelectValue placeholder="Chọn kỹ thuật" />
              </SelectTrigger>
              <SelectContent>
                {techniques.map((technique) => (
                  <SelectItem key={technique.id} value={technique.id}>
                    {technique.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.techniqueId && (
              <p className="text-sm text-red-500">{errors.techniqueId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Câu Hỏi *</Label>
            <Textarea
              id="question"
              placeholder="Nhập câu hỏi (10-500 ký tự)"
              value={questionText}
              onChange={(e) => {
                setQuestionText(e.target.value);
                setErrors({ ...errors, questionText: "" });
              }}
              className="min-h-24"
            />
            <div className="text-sm text-foreground/60">
              {questionText.length}/500 ký tự
            </div>
            {errors.questionText && (
              <p className="text-sm text-red-500">{errors.questionText}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Độ Khó *</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Dễ</SelectItem>
                <SelectItem value="Medium">Trung bình</SelectItem>
                <SelectItem value="Hard">Khó</SelectItem>
              </SelectContent>
            </Select>
            {errors.difficulty && (
              <p className="text-sm text-red-500">{errors.difficulty}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Tùy Chọn Trả Lời *</Label>
            {answerOptions.map((option, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder={`Tùy chọn ${index + 1}`}
                    value={option.answerText}
                    onChange={(e) =>
                      handleUpdateOption(index, "answerText", e.target.value)
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={option.isCorrect}
                    onChange={(e) =>
                      handleUpdateOption(index, "isCorrect", e.target.checked)
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-foreground/70">Đúng</span>
                </div>
                {answerOptions.length > 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveOption(index)}
                    className="gap-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {errors.answerOptions && (
              <p className="text-sm text-red-500">{errors.answerOptions}</p>
            )}
            {errors.correctAnswer && (
              <p className="text-sm text-red-500">{errors.correctAnswer}</p>
            )}
            <Button
              variant="outline"
              onClick={handleAddOption}
              className="w-full bg-transparent"
            >
              Thêm Tùy Chọn
            </Button>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary/90"
          >
            Cập Nhật
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
