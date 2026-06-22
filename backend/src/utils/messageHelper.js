export const updateConversationAfterCreateMessage = (
  conversation,
  message,
  senderId,
) => {
  conversation.set({
    seenBy: [],
    lastMessageAt: message.createdAt,
    lastMessage: {
      _id: message._id,
      content: message.content,
      senderId,
      createdAt: message.createdAt,
    },
  });

  conversation.participants.forEach((p) => {
    const memberId = p.userId.toString();
    const isSender = memberId === senderId.toString();
    const prevCount = conversation.unreadCounts.get(memberId) || 0;
    conversation.unreadCounts.set(memberId, isSender ? 0 : prevCount + 1);
    p.isHidden = false;
  });
};

export const emitNewMessage = async (io, conversation, message) => {
  await conversation.populate([
    { path: "participants.userId", select: "username displayName avatarUrl" },
    { path: "seenBy", select: "displayName avatarUrl" },
    { path: "lastMessage.senderId", select: "displayName avatarUrl" },
  ]);

  const participants = (conversation.participants || []).map((p) => ({
    _id: p.userId?._id,
    username: p.userId?.username,
    displayName: p.userId?.displayName,
    avatarUrl: p.userId?.avatarUrl ?? null,
    joinedAt: p.joinedAt,
    role: p.role,
  }));

  const formattedConvo = {
    ...conversation.toObject(),
    participants,
    unreadCounts: conversation.unreadCounts || {},
  };

  io.to(conversation._id.toString()).emit("new-message", {
    message,
    conversation: formattedConvo,
    unreadCounts: conversation.unreadCounts,
  });
};
