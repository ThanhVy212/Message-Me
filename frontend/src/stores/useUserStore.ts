import type { UserState } from "@/types/store";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import { useChatStore } from "./useChatStore";

export const useUserStore = create<UserState>((set, get) => ({
  updateAvatarUrl: async (formData) => {
    try {
      const { user, setUser } = useAuthStore.getState();
      const data = await userService.uploadAvatar(formData);

      if (user) {
        setUser({
          ...user,
          avatarUrl: data.avatarUrl,
        });

        useChatStore.getState().fetchConversations();
      }
    } catch (err) {
      console.error("Lỗi khi uploadAvatarUrl", err);
      toast.error("Upload avatar không thành công!");
    }
  },

  addPassword: async (password: string) => {
    try {
      await userService.addPassword(password);
      toast.success("Thêm mật khẩu thành công");
      await useAuthStore.getState().fetchMe();
    } catch (err: any) {
      console.error(err);
      const errMsg =
        err.response?.data?.message || "Lỗi xảy ra khi addPassword";
      toast.error(errMsg);
      throw new Error(errMsg);
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    try {
      await userService.changePassword(oldPassword, newPassword);
      toast.success("Đổi mật khẩu thành công");
      await useAuthStore.getState().fetchMe();
    } catch (err: any) {
      console.error(err);
      const errMsg =
        err.response?.data?.message || "Lỗi xảy ra khi changePassword";
      toast.error(errMsg);
      throw new Error(errMsg);
    }
  },

  updateProfile: async (displayName, phone, bio) => {
    try {
      const data = await userService.updateProfile(displayName, phone, bio);
      toast.success("Cập nhật thông tin thành công");
      useAuthStore.getState().setUser(data.user);
    } catch (err: any) {
      console.error(err);
      const errMsg =
        err.response?.data?.message || "Lỗi xảy ra khi updateProfile";
      toast.error(errMsg);
      throw new Error(errMsg);
    }
  },
}));
