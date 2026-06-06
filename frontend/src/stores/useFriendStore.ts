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
    } catch (err: any) {
      throw err.response?.data;
    } finally {
      set({ loading: false });
    }
  },
}));
