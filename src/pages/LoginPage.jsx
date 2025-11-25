import { Link } from "react-router-dom";
import { use, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import axiosCustom from "@/config/axiosCustom";
import { useNavigate } from "react-router-dom";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const returnToHome = () => {
    navigate("/");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axiosCustom.post("/Account/login", {
        email,
        password,
      });
      const { token, user } = response.data;
      //console.log("Received token:", token);
      //console.log("User info:", user);
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("roles", JSON.stringify(user.roles));

      const userResponse = await axiosCustom.get("/users/me");
      const userData = userResponse.data;
      sessionStorage.setItem("user", JSON.stringify(userData));
      //console.log("Logged in user:", userData);

      navigate("/admin");
    } catch (err) {
      setError("Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div onClick={returnToHome} className="flex items-center gap-2">
            <div className="bg-linear-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">FirstAid</span>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Đăng nhập
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Chào mừng bạn quay lại. Hãy đăng nhập để tiếp tục học tập.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mật khẩu
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">Nhớ tôi</span>
                </label>
                {/* Thay href="#" bằng to="#" */}
                <Link
                  to="#"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2.5 rounded-lg transition-all"
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600">
                Chưa có tài khoản?{" "}
                {/* Thay href="/auth/signup" bằng to="/auth/signup" */}
                <Link
                  to="/auth/signup"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </Card>

        <p className="text-center text-gray-500 text-sm mt-8">
          Bằng cách đăng nhập, bạn đồng ý với {/* Thay href="#" bằng to="#" */}
          <Link to="#" className="text-emerald-600 hover:underline">
            Điều khoản dịch vụ
          </Link>{" "}
          và{" "}
          <Link to="#" className="text-emerald-600 hover:underline">
            Chính sách bảo mật
          </Link>
        </p>
      </div>
    </div>
  );
}
