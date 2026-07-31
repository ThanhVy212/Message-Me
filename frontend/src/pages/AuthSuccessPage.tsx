import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";

const AuthSuccessPage = () => {
  const navigate = useNavigate();
  const { refresh } = useAuthStore();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      await refresh();
      if (useAuthStore.getState().accessToken) {
        navigate("/", { replace: true });
      } else {
        navigate("/signin", { replace: true });
      }
    };

    handleAuthSuccess();
  }, [refresh, navigate]);

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
