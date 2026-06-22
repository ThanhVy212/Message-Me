import api from "@/lib/axios";
import type { ConversationResponse, Message } from "@/types/chat";

interface FetchMessagesProps {
  messages: Message[];
  cursor?: string;
}

const pageLimit = 50;

export const chatService = {
  async fetchConversations(): Promise<ConversationResponse> {
    const res = await api.get("/conversations");
    return res.data;
  },

  async fetchMessages(
    id: string,
    cursor?: string,
  ): Promise<FetchMessagesProps> {
    const res = await api.get(
      `/conversations/${id}/messages?limit=${pageLimit}&cursor=${cursor}`,
    );

    return { messages: res.data.messages, cursor: res.data.nextCursor };
  },

  async sendDirectMessage(
    recipientId: string,
    content: string = "",
    imgUrl?: string,
    conversationId?: string,
  ) {
    const res = await api.post("/messages/direct", {
      recipientId,
      content,
      imgUrl,
      conversationId,
    });
    return res.data.message;
  },

  async sendGroupMessage(
    conversationId: string,
    content: string = "",
    imgUrl?: string,
  ) {
    const res = await api.post("/messages/group", {
      conversationId,
      content,
      imgUrl,
    });
    return res.data.message;
  },

  async markAsSeen(conversationId: string) {
    const res = await api.patch(`/conversations/${conversationId}/seen`);
    return res.data;
  },

  async createConversation(
    type: "direct" | "group",
    name: string,
    memberIds: string[],
  ) {
    const res = await api.post("/conversations", { type, name, memberIds });
    return res.data.conversation;
  },

  async deleteConversation(conversationId: string) {
    const res = await api.delete(`/conversations/${conversationId}`);
    return res.data;
  },

  async hideConversation(conversationId: string, isHidden: boolean) {
    const res = await api.patch(`/conversations/${conversationId}/hide`, { isHidden });
    return res.data;
  },

  async recallMessage(messageId: string) {
    const res = await api.post(`/messages/${messageId}/recall`);
    return res.data.message;
  },

  async deleteMessageMySide(messageId: string) {
    const res = await api.post(`/messages/${messageId}/delete-my-side`);
    return res.data;
  },

  async uploadGroupAvatar(conversationId: string, formData: FormData) {
    const res = await api.post(`/conversations/${conversationId}/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.conversation;
  },

  async fetchAllGroups(): Promise<ConversationResponse> {
    const res = await api.get("/conversations/all-groups");
    return res.data;
  },

  async leaveGroup(conversationId: string) {
    const res = await api.post(`/conversations/${conversationId}/leave`);
    return res.data;
  },

  async transferAdmin(conversationId: string, newAdminId: string) {
    const res = await api.post(`/conversations/${conversationId}/transfer-admin`, { newAdminId });
    return res.data.conversation;
  },

  async deleteGroup(conversationId: string) {
    const res = await api.delete(`/conversations/${conversationId}/group`);
    return res.data;
  },

  async addGroupMembers(conversationId: string, memberIds: string[]) {
    const res = await api.post(`/conversations/${conversationId}/members`, {
      memberIds,
    });
    return res.data.conversation;
  },
};
