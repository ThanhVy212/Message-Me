import { friendService } from "@/services/friendService";
import type { FriendState } from "@/types/store";
import axios from "axios";
import { create } from "zustand";

export const useFriendStore = create<FriendState>((set, get) => ({
  loading: false,
  searchByUsername: async (username) => {
    try {
      set({ loading: true });

      const user = await friendService.searchByUsername(username);

      return user;
    } catch (err) {
      console.error("Lỗi xảy ra khi tìm user bằng username", err);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  addFriend: async (to, message) => {
    try {
      set({ loading: true });

      const resultMessage = await friendService.sendFriendRequest(to, message);

      return resultMessage;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log("Status:", err.response?.status);
        console.log("Data:", err.response?.data);
      }

      console.error("Lỗi xảy ra khi addFriend", err);
      return "Lỗi xảy ra khi gửi kết bạn. Hãy thử lại";
    } finally {
      set({ loading: false });
    }
  },
}));
