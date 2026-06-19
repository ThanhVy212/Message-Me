import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

const PublicRoute = () => {
  const { accessToken, refresh } = useAuthStore();
  const [starting, setStarting] = useState(true);

  const init = async () => {
    if (!accessToken) {
      try {
        await refresh();
      } catch (err) {
        console.error("Lỗi khi gọi refresh trong PublicRoute", err);
      }
    }
    setStarting(false);
  };

  useEffect(() => {
    init();
  }, []);

  if (starting) {
    return (
      <div className="flex h-screen items-center justify-center">
        Đang tải trang...
      </div>
    );
  }

  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
