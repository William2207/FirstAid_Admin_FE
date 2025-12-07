import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Không có quyền truy cập
            </h1>
            <p className="text-gray-600 mb-8">
              Bạn không có quyền hạn để truy cập trang này. Vui lòng liên hệ
              quản trị viên nếu bạn cho rằng đây là một lỗi.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-red-700 text-sm">
                Chỉ người dùng có vai trò <strong>Admin</strong> mới có thể truy
                cập trang quản lý này.
              </p>
            </div>

            <Link to="/auth/login">
              <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
                <Home className="w-4 h-4" />
                Quay lại đăng nhập
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
