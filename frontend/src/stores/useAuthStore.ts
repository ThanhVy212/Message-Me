import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  setAccessToken: (accessToken) => {
    set({ accessToken });
  },

  clearState: () => {
    set({ accessToken: null, user: null, loading: false });
  },

  signUp: async (username, password, email, firstName, lastName) => {
    try {
      set({ loading: true });

      await authService.signUp(username, password, email, firstName, lastName);

      toast.success(
        "Đăng ký thành công! Bạn sẽ được chuyển sang trang đăng nhập",
      );

      return true;
    } catch (err: any) {
      console.error(err);

      toast.error(err.response?.data?.message || "Đăng ký không thành công");

      return false;
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (username, password): Promise<boolean> => {
    try {
      set({ loading: true });

      const { accessToken } = await authService.signIn(username, password);

      get().setAccessToken(accessToken);

      await get().fetchMe();

      toast.success("Chào mừng bạn quay lại");

      return true;
    } catch (err: any) {
      console.error(err);

      toast.error(err.response?.data?.message || "Đăng nhập không thành công");

      return false;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      get().clearState();
      await authService.signOut();
      toast.success("Đăng xuất thành công");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi xảy ra khi đăng xuất hãy thử lại");
    }
  },

  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchMe();

      set({ user });
    } catch (err) {
      console.error(err);
      set({ user: null, accessToken: null });
      toast.error("Lỗi xảy ra khi lấy dữ liệu hãy thử lại");
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    try {
      set({ loading: true });
      const { user, fetchMe, setAccessToken } = get();
      const accessToken = await authService.refresh();
      setAccessToken(accessToken);

      if (!user) {
        await fetchMe();
      }
    } catch (err) {
      console.error(err);
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
      get().clearState();
    } finally {
      set({ loading: false });
    }
  },
}));
