import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";

const AuthSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAccessToken } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
      // Lưu accessToken vào Zustand store
      setAccessToken(accessToken);
      // Lưu refreshToken vào localStorage
      localStorage.setItem("refreshToken", refreshToken);
      // Chuyển hướng về trang chủ
      navigate("/", { replace: true });
    } else {
      // Nếu thiếu token, chuyển hướng về trang đăng nhập
      navigate("/signin", { replace: true });
    }
  }, [searchParams, setAccessToken, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        {/* Loading Spinner */}
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-lg font-medium animate-pulse">Đang thiết lập phiên đăng nhập...</p>
      </div>
    </div>
  );
};

export default AuthSuccessPage;
