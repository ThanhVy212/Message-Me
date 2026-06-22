import { isSameId, normalizeParticipant } from "@/lib/utils";
import { chatService } from "@/services/chatService";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";
import { useSocketStore } from "./useSocketStore";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      groupsList: [],
      messages: {},
      activeConversationId: null,
      convoLoading: false,
      messageLoading: false,
      loading: false,

      setActiveConversation: (id) => set({ activeConversationId: id }),
      reset: () => {
        set({
          conversations: [],
          groupsList: [],
          messages: {},
          activeConversationId: null,
          convoLoading: false,
          messageLoading: false,
        });
      },
      fetchConversations: async () => {
        try {
          set({ convoLoading: true });
          const { conversations } = await chatService.fetchConversations();

          set({
            conversations: conversations.map((c) => ({
              ...c,
              participants: (c.participants ?? []).map(normalizeParticipant),
            })),
            convoLoading: false,
          });
        } catch (err) {
          console.error("Lỗi xảy ra khi fetchConversations:", err);
          set({ convoLoading: false });
        }
      },
      fetchMessages: async (conversationId) => {
        const { activeConversationId, messages } = get();
        const { user } = useAuthStore.getState();

        const convoId = conversationId ?? activeConversationId;

        if (!convoId) return;

        const current = messages?.[convoId];
        const nextCursor =
          current?.nextCursor === undefined ? "" : current?.nextCursor;

        if (nextCursor === null) return;

        set({ messageLoading: true });

        try {
          const { messages: fetched, cursor } = await chatService.fetchMessages(
            convoId,
            nextCursor,
          );

          const processed = fetched.map((m) => ({
            ...m,
            isOwn: isSameId(m.senderId, user?._id),
          }));

          set((state) => {
            const prev = state.messages[convoId]?.items ?? [];
            const merged =
              prev.length > 0 ? [...processed, ...prev] : processed;

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: merged,
                  hasMore: !!cursor,
                  nextCursor: cursor ?? null,
                },
              },
            };
          });
        } catch (err) {
          console.error("Lỗi khi gọi fetchMessages", err);
        } finally {
          set({ messageLoading: false });
        }
      },
      sendDirectMessage: async (recipientId, content, imgUrl) => {
        try {
          const { activeConversationId } = get();
          await chatService.sendDirectMessage(
            recipientId,
            content,
            imgUrl,
            activeConversationId || undefined,
          );

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId ? { ...c, seenBy: [] } : c,
            ),
          }));
        } catch (err) {
          console.error("Lỗi xảy ra khi gửi direct message", err);
        }
      },
      sendGroupMessage: async (conversationId, content, imgUrl) => {
        try {
          await chatService.sendGroupMessage(conversationId, content, imgUrl);
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === get().activeConversationId ? { ...c, seenBy: [] } : c,
            ),
          }));
        } catch (err) {
          console.error("Lỗi xảy ra khi gửi group message", err);
        }
      },
      addMessage: async (message) => {
        try {
          const { user } = useAuthStore.getState();
          const { fetchMessages } = get();

          message.isOwn = isSameId(message.senderId, user?._id);

          const convoId = message.conversationId;

          let prevItems = get().messages[convoId]?.items ?? [];

          if (prevItems.length === 0) {
            await fetchMessages(message.conversationId);
            prevItems = get().messages[convoId]?.items ?? [];
          }

          set((state) => {
            if (prevItems.some((m) => m._id === message._id)) {
              return state;
            }

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: [...prevItems, message],
                  hasMore: state.messages[convoId].hasMore,
                  nextCursor: state.messages[convoId].nextCursor ?? undefined,
                },
              },
            };
          });
        } catch (err) {
          console.error("Lỗi xảy ra khi add message", err);
        }
      },

      updateConversation: (conversation: any) => {
        const normalized = {
          ...conversation,
          participants: (conversation.participants ?? []).map(
            normalizeParticipant,
          ),
        };

        set((state) => {
          const exists = state.conversations.some((c) =>
            isSameId(c._id, normalized._id),
          );
          let newConversations = state.conversations;
          if (!exists) {
            newConversations = [normalized, ...state.conversations];
          } else {
            newConversations = state.conversations.map((c) =>
              isSameId(c._id, normalized._id) ? { ...c, ...normalized } : c,
            );
          }

          const newGroupsList = state.groupsList.some((g) =>
            isSameId(g._id, normalized._id),
          )
            ? state.groupsList.map((g) =>
                isSameId(g._id, normalized._id) ? { ...g, ...normalized } : g,
              )
            : normalized.type === "group"
              ? [normalized, ...state.groupsList]
              : state.groupsList;

          return {
            conversations: newConversations,
            groupsList: newGroupsList,
          };
        });
      },
      markAsSeen: async () => {
        try {
          const { user } = useAuthStore.getState();
          const { activeConversationId, conversations } = get();

          if (!activeConversationId || !user) {
            return;
          }

          const convo = conversations.find(
            (c) => c._id === activeConversationId,
          );

          if (!convo) {
            return;
          }

          if ((convo.unreadCounts?.[user._id] ?? 0) === 0) {
            return;
          }

          await chatService.markAsSeen(activeConversationId);

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId && c.lastMessage
                ? {
                    ...c,
                    unreadCounts: {
                      ...c.unreadCounts,
                      [user._id]: 0,
                    },
                  }
                : c,
            ),
          }));
        } catch (err) {
          console.error("Lỗi xảy ra khi gọi markAsSeen trong store", err);
        }
      },

      addConvo: async (convo) => {
        const normalized = {
          ...convo,
          participants: (convo.participants ?? []).map(normalizeParticipant),
        };

        set((state) => {
          const exists = state.conversations.some(
            (c) => c._id.toString() === normalized._id.toString(),
          );

          return {
            conversations: exists
              ? state.conversations
              : [normalized, ...state.conversations],
            activeConversationId: normalized._id,
          };
        });
      },
      createConversation: async (type, name, memberIds) => {
        try {
          set({ loading: true });

          const conversation = await chatService.createConversation(
            type,
            name,
            memberIds,
          );

          get().addConvo(conversation);

          useSocketStore
            .getState()
            .socket?.emit("join-conversation", conversation._id);

          const { messages, fetchMessages } = get();
          if (!messages[conversation._id]) {
            await fetchMessages(conversation._id);
          }
        } catch (err) {
          console.error("Lỗi xảy ra khi gọi conversation trong store", err);
        } finally {
          set({ loading: false });
        }
      },
      deleteConversation: async (conversationId) => {
        try {
          set({ loading: true });
          await chatService.deleteConversation(conversationId);
          set((state) => {
            const newConversations = state.conversations.filter(
              (c) => c._id !== conversationId,
            );
            const activeId =
              state.activeConversationId === conversationId
                ? null
                : state.activeConversationId;
            
            // Clear message history in client store
            const newMessages = { ...state.messages };
            delete newMessages[conversationId];

            return {
              conversations: newConversations,
              activeConversationId: activeId,
              messages: newMessages,
            };
          });
        } catch (err) {
          console.error("Lỗi xảy ra khi deleteConversation", err);
        } finally {
          set({ loading: false });
        }
      },
      hideConversation: async (conversationId, isHidden) => {
        try {
          set({ loading: true });
          await chatService.hideConversation(conversationId, isHidden);
          set((state) => {
            const newConversations = state.conversations.filter(
              (c) => c._id !== conversationId,
            );
            const activeId =
              state.activeConversationId === conversationId
                ? null
                : state.activeConversationId;
            return {
              conversations: newConversations,
              activeConversationId: activeId,
            };
          });
        } catch (err) {
          console.error("Lỗi xảy ra khi hideConversation", err);
        } finally {
          set({ loading: false });
        }
      },
      recallMessage: async (messageId) => {
        try {
          await chatService.recallMessage(messageId);
        } catch (err) {
          console.error("Lỗi xảy ra khi recallMessage", err);
        }
      },
      deleteMessageMySide: async (messageId) => {
        try {
          const { activeConversationId } = get();
          if (!activeConversationId) return;
          await chatService.deleteMessageMySide(messageId);
          set((state) => {
            const convoId = activeConversationId;
            const current = state.messages[convoId];
            if (!current) return state;
            const updatedItems = current.items.filter(
              (item) => item._id !== messageId,
            );
            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  ...current,
                  items: updatedItems,
                },
              },
            };
          });
        } catch (err) {
          console.error("Lỗi xảy ra khi deleteMessageMySide", err);
        }
      },
      uploadGroupAvatar: async (conversationId, formData) => {
        try {
          set({ loading: true });
          const conversation = await chatService.uploadGroupAvatar(
            conversationId,
            formData,
          );
          get().updateConversation(conversation);
        } catch (err) {
          console.error("Lỗi xảy ra khi uploadGroupAvatar", err);
        } finally {
          set({ loading: false });
        }
      },
      fetchGroupsList: async () => {
        try {
          set({ convoLoading: true });
          const { conversations } = await chatService.fetchAllGroups();
          set({
            groupsList: conversations.map((c) => ({
              ...c,
              participants: (c.participants ?? []).map(normalizeParticipant),
            })),
            convoLoading: false,
          });
        } catch (err) {
          console.error("Lỗi xảy ra khi fetchGroupsList", err);
          set({ convoLoading: false });
        }
      },
      leaveGroup: async (conversationId) => {
        try {
          set({ loading: true });
          await chatService.leaveGroup(conversationId);
          set((state) => {
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
        } catch (err) {
          console.error("Lỗi xảy ra khi leaveGroup", err);
        } finally {
          set({ loading: false });
        }
      },
      transferAdmin: async (conversationId, newAdminId) => {
        try {
          set({ loading: true });
          const updated = await chatService.transferAdmin(
            conversationId,
            newAdminId,
          );
          get().updateConversation(updated);
        } catch (err) {
          console.error("Lỗi xảy ra khi transferAdmin", err);
        } finally {
          set({ loading: false });
        }
      },
      deleteGroup: async (conversationId) => {
        try {
          set({ loading: true });
          await chatService.deleteGroup(conversationId);
          set((state) => {
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
        } catch (err) {
          console.error("Lỗi xảy ra khi deleteGroup", err);
        } finally {
          set({ loading: false });
        }
      },
      addGroupMembers: async (conversationId, memberIds) => {
        try {
          set({ loading: true });
          const conversation = await chatService.addGroupMembers(
            conversationId,
            memberIds,
          );
          get().updateConversation(conversation);
        } catch (err) {
          console.error("Lỗi xảy ra khi addGroupMembers", err);
          throw err;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({ conversations: state.conversations }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<ChatState> | undefined;
        if (!saved?.conversations) {
          return current;
        }

        return {
          ...current,
          conversations: saved.conversations.map((c) => ({
            ...c,
            participants: (c.participants ?? []).map(normalizeParticipant),
          })),
        };
      },
    },
  ),
);
