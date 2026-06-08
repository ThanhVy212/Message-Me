import { friendService } from "@/services/friendService";
import type { FriendState } from "@/types/store";
import { create } from "zustand";

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  loading: false,
  receivedList: [],
  sentList: [],
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
  getAllFriendRequests: async () => {
    try {
      set({ loading: true });

      const result = await friendService.getAllFriendRequest();

      if (!result) {
        return;
      }

      const { received, sent } = result;

      set({ receivedList: received, sentList: sent });
    } catch (err) {
      console.error("Lỗi xảy ra khi getAllFriendRequests", err);
    } finally {
      set({ loading: false });
    }
  },
  acceptFriendRequest: async (requestId) => {
    try {
      set({ loading: true });
      await friendService.acceptFriendRequest(requestId);

      set((state) => ({
        receivedList: state.receivedList.filter((r) => r._id !== requestId),
      }));
    } catch (err) {
      console.error("Lỗi xảy ra khi acceptFriendRequest", err);
    } finally {
      set({ loading: false });
    }
  },
  declineFriendRequest: async (requestId) => {
    try {
      set({ loading: true });
      await friendService.declineFriendRequest(requestId);

      set((state) => ({
        receivedList: state.receivedList.filter((r) => r._id !== requestId),
      }));
    } catch (err) {
      console.error("Lỗi xảy ra khi declineFriendRequest", err);
    } finally {
      set({ loading: false });
    }
  },
  cancelFriendRequest: async (requestId) => {
    try {
      set({ loading: true });
      await friendService.cancelFriendRequest(requestId);

      set((state) => ({
        sentList: state.sentList.filter((r) => r._id !== requestId),
      }));
    } catch (err) {
      console.error("Lỗi xảy ra khi cancelFriendRequest", err);
    } finally {
      set({ loading: false });
    }
  },

  getFriends: async () => {
    try {
      set({ loading: true });
      const friends = await friendService.getFriendList();

      set({ friends: friends });
    } catch (err) {
      console.error("Lỗi xảy ra khi load friends", err);
      set({ friends: [] });
    } finally {
      set({ loading: false });
    }
  },
}));
