import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "./useChatStore";

const baseURL = import.meta.env.VITE_SOCKET_URL;

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],
  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    const existingSocket = get().socket;

    if (existingSocket) return;

    const socket: Socket = io(baseURL, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    set({ socket });

    socket.on("connect", () => {
      console.log("Đã kết nối với socket");
    });

    //online users
    socket.on("online-users", (userIds) => {
      set({ onlineUsers: userIds });
    });

    //new message
    socket.on("new-message", ({ message, conversation, unreadCounts }) => {
      useChatStore.getState().addMessage(message);

      const senderObj = conversation.lastMessage?.senderId;
      const lastMessage = conversation.lastMessage
        ? {
            _id: conversation.lastMessage._id,
            content: conversation.lastMessage.content,
            createdAt: conversation.lastMessage.createdAt,
            isRecalled: conversation.lastMessage.isRecalled,
            sender: {
              _id: senderObj?._id || senderObj || "",
              displayName: senderObj?.displayName || "",
              avatarUrl: senderObj?.avatarUrl || null,
            },
          }
        : null;

      const updateConversation = {
        ...conversation,
        lastMessage,
        unreadCounts,
      };

      if (
        useChatStore.getState().activeConversationId === message.conversationId
      ) {
        useChatStore.getState().markAsSeen();
      }

      useChatStore.getState().updateConversation(updateConversation);
    });

    //read message
    socket.on("read-message", ({ conversation, lastMessage }) => {
      const updated = {
        _id: conversation._id,
        lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCounts: conversation.unreadCounts,
        seenBy: conversation.seenBy,
      };

      useChatStore.getState().updateConversation(updated);
    });

    //new group
    socket.on("new-group", (conversation) => {
      useChatStore.getState().addConvo(conversation);
      socket.emit("join-conversation", conversation._id);
    });

    //message recalled
    socket.on(
      "message-recalled",
      ({ messageId, conversationId, lastMessage }) => {
        useChatStore.setState((state) => {
          const convoId = conversationId;
          const current = state.messages[convoId];
          if (!current) return state;

          const updatedItems = current.items.map((item) => {
            if (item._id === messageId) {
              return {
                ...item,
                content: "Tin nhắn đã được thu hồi",
                isRecalled: true,
                imgUrl: null,
              };
            }
            return item;
          });

          const newConversations = state.conversations.map((c) => {
            if (c._id === convoId && c.lastMessage?._id === messageId) {
              return {
                ...c,
                lastMessage: lastMessage
                  ? {
                      ...c.lastMessage,
                      content: "Tin nhắn đã được thu hồi",
                      isRecalled: true,
                    }
                  : null,
              };
            }
            return c;
          });

          return {
            messages: {
              ...state.messages,
              [convoId]: {
                ...current,
                items: updatedItems,
              },
            },
            conversations: newConversations,
          };
        });
      },
    );

    //group updated
    socket.on("group-updated", (conversation) => {
      useChatStore.getState().updateConversation(conversation);
    });

    //group left
    socket.on("group-left", ({ conversationId }) => {
      useChatStore.setState((state) => {
        const newConversations = state.conversations.filter(
          (c) => c._id !== conversationId,
        );
        const newGroupsList = state.groupsList.filter(
          (g) => g._id !== conversationId,
        );
        const activeId =
          state.activeConversationId === conversationId
            ? null
            : state.activeConversationId;
        return {
          conversations: newConversations,
          groupsList: newGroupsList,
          activeConversationId: activeId,
        };
      });
    });

    //group deleted
    socket.on("group-deleted", ({ conversationId }) => {
      useChatStore.setState((state) => {
        const newConversations = state.conversations.filter(
          (c) => c._id !== conversationId,
        );
        const newGroupsList = state.groupsList.filter(
          (g) => g._id !== conversationId,
        );
        const activeId =
          state.activeConversationId === conversationId
            ? null
            : state.activeConversationId;

        const newMessages = { ...state.messages };
        delete newMessages[conversationId];

        return {
          conversations: newConversations,
          groupsList: newGroupsList,
          activeConversationId: activeId,
          messages: newMessages,
        };
      });
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
