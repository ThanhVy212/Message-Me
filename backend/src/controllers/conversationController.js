import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { io } from "../socket/index.js";
import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware.js";

export const createConversation = async (req, res) => {
  try {
    const { type, name, memberIds } = req.body;
    const userId = req.user._id;

    if (
      !type ||
      (type === "group" && !name) ||
      !memberIds ||
      !Array.isArray(memberIds) ||
      memberIds.length == 0
    ) {
      return res
        .status(400)
        .json({ message: "Tên nhóm và danh sách thành viên là bắt buộc" });
    }

    let conversation;

    if (type === "direct") {
      const participantId = memberIds[0];

      conversation = await Conversation.findOne({
        type: "direct",
        "participants.userId": { $all: [userId, participantId] },
      });

      if (!conversation) {
        conversation = new Conversation({
          type: "direct",
          participants: [
            { userId, role: "member" },
            { userId: participantId, role: "member" },
          ],
          lastMessageAt: new Date(),
        });

        await conversation.save();
      } else {
        conversation.participants.forEach((p) => {
          p.isHidden = false;
        });
        await conversation.save();
      }
    }

    if (type === "group") {
      conversation = new Conversation({
        type: "group",
        participants: [
          { userId, role: "admin" },
          ...memberIds.map((id) => ({ userId: id, role: "member" })),
        ],
        group: {
          name,
          createdBy: userId,
          avatarUrl: null,
          avatarId: null,
        },
        lastMessageAt: new Date(),
      });

      await conversation.save();
    }

    if (!conversation) {
      return res
        .status(400)
        .json({ message: "Conversation type không hợp lệ" });
    }

    await conversation.populate([
      {
        path: "participants.userId",
        select: "username displayName avatarUrl",
      },
      {
        path: "seenBy",
        select: "displayName avatarUrl",
      },
      { path: "lastMessage.senderId", select: "displayName avatarUrl" },
    ]);

    const p = conversation.participants.find(
      (part) => part.userId?._id?.toString() === userId.toString(),
    );
    let lastMessage = conversation.lastMessage;
    if (p && p.deletedAt && lastMessage) {
      const lastMsgTime = new Date(lastMessage.createdAt).getTime();
      const deleteTime = new Date(p.deletedAt).getTime();
      if (lastMsgTime <= deleteTime) {
        lastMessage = null;
      }
    }

    const participants = (conversation.participants || []).map((part) => ({
      _id: part.userId?._id,
      username: part.userId?.username,
      displayName: part.userId?.displayName,
      avatarUrl: part.userId?.avatarUrl ?? null,
      joinedAt: part.joinedAt,
      role: part.role,
    }));

    const formatted = { ...conversation.toObject(), participants, lastMessage };

    if (type === "group") {
      memberIds.forEach((userId) => {
        io.to(userId).emit("new-group", formatted);
      });
    }

    return res.status(201).json({ conversation: formatted });
  } catch (err) {
    console.error("Lỗi khi tạo conversation", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({
      "participants.userId": userId,
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate({
        path: "participants.userId",
        select: "username displayName avatarUrl",
      })
      .populate({
        path: "lastMessage.senderId",
        select: "displayName avatarUrl",
      })
      .populate({
        path: "seenBy",
        select: "displayName avatarUrl",
      });

    const formatted = conversations
      .filter((convo) => {
        const p = convo.participants.find(
          (part) => part.userId?._id?.toString() === userId.toString(),
        );
        if (!p) return false;
        if (p.isHidden) return false;
        if (p.deletedAt) {
          const lastMsgTime = new Date(
            convo.lastMessageAt || convo.updatedAt || convo.createdAt,
          ).getTime();
          const deleteTime = new Date(p.deletedAt).getTime();
          if (lastMsgTime <= deleteTime) {
            return false;
          }
        }
        return true;
      })
      .map((convo) => {
        const p = convo.participants.find(
          (part) => part.userId?._id?.toString() === userId.toString(),
        );
        let lastMessage = convo.lastMessage;
        if (p && p.deletedAt && lastMessage) {
          const lastMsgTime = new Date(lastMessage.createdAt).getTime();
          const deleteTime = new Date(p.deletedAt).getTime();
          if (lastMsgTime <= deleteTime) {
            lastMessage = null;
          }
        }

        const participants = (convo.participants || []).map((part) => ({
          _id: part.userId?._id,
          username: part.userId?.username,
          displayName: part.userId?.displayName,
          avatarUrl: part.userId?.avatarUrl ?? null,
          joinedAt: part.joinedAt,
          role: part.role,
        }));

        return {
          ...convo.toObject(),
          unreadCounts: convo.unreadCounts || {},
          participants,
          lastMessage,
        };
      });

    return res.status(200).json({ conversations: formatted });
  } catch (err) {
    console.error("Lỗi khi lấy conversations", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, cursor } = req.query;
    const userId = req.user._id;

    const convo = await Conversation.findById(conversationId);
    if (!convo) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy cuộc trò chuyện" });
    }

    const participant = convo.participants.find(
      (p) => p.userId.toString() === userId.toString(),
    );
    if (!participant) {
      return res
        .status(403)
        .json({ message: "Bạn không tham gia cuộc trò chuyện này" });
    }

    const query = {
      conversationId,
      deletedBy: { $ne: userId },
    };

    if (cursor) {
      if (participant.deletedAt) {
        query.createdAt = {
          $lt: new Date(cursor),
          $gt: participant.deletedAt,
        };
      } else {
        query.createdAt = { $lt: new Date(cursor) };
      }
    } else if (participant.deletedAt) {
      query.createdAt = { $gt: participant.deletedAt };
    }

    let messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) + 1);

    let nextCursor = null;

    if (messages.length > Number(limit)) {
      const nextMessage = messages[messages.length - 1];
      nextCursor = nextMessage.createdAt.toISOString();
      messages.pop();
    }

    messages = messages.reverse();

    return res.status(200).json({
      messages,
      nextCursor,
    });
  } catch (err) {
    console.error("Lỗi khi lấy messages", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getUserConversationsForSocketIO = async (userId) => {
  try {
    const conversations = await Conversation.find(
      { "participants.userId": userId },
      { _id: 1 },
    );

    return conversations.map((c) => c._id.toString());
  } catch (err) {
    console.error("Lỗi khi fetch conversations: ", err);
    return [];
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    const conversation = await Conversation.findById(conversationId).lean();

    if (!conversation) {
      return res.status(404).json({ message: "Conversation không tồn tại" });
    }

    const last = conversation.lastMessage;

    if (!last) {
      return res
        .status(200)
        .json({ message: "Không có tin nhắn để mark as seen" });
    }

    if (last.senderId.toString() === userId) {
      return res.status(200).json({ message: "Sender không cần mark as seen" });
    }

    const updated = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $addToSet: { seenBy: userId },
        $set: { [`unreadCounts.${userId}`]: 0 },
      },
      {
        returnDocument: "after",
      },
    );

    io.to(conversationId).emit("read-message", {
      conversation: updated,
      lastMessage: {
        _id: updated?.lastMessage._id,
        content: updated?.lastMessage.content,
        createdAt: updated?.lastMessage.createdAt,
        sender: {
          _id: updated?.lastMessage.senderId,
        },
      },
    });

    return res.status(200).json({
      message: "Marked as seen",
      seenBy: updated?.seenBy || [],
      myUnreadCount: updated?.unreadCounts[userId] || 0,
    });
  } catch (err) {
    console.error("Lỗi khi mark as seen");
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Cuộc trò chuyện không tồn tại" });
    }

    const participant = conversation.participants.find(
      (p) => p.userId.toString() === userId,
    );

    if (!participant) {
      return res
        .status(403)
        .json({ message: "Bạn không tham gia cuộc trò chuyện này" });
    }

    participant.deletedAt = new Date();
    conversation.unreadCounts.set(userId, 0);
    participant.isHidden = false;

    await conversation.save();

    return res.status(200).json({ message: "Xóa cuộc trò chuyện thành công" });
  } catch (err) {
    console.error("Lỗi khi xóa cuộc trò chuyện", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const hideConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { isHidden } = req.body;
    const userId = req.user._id.toString();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Cuộc trò chuyện không tồn tại" });
    }

    const participant = conversation.participants.find(
      (p) => p.userId.toString() === userId,
    );

    if (!participant) {
      return res
        .status(403)
        .json({ message: "Bạn không tham gia cuộc trò chuyện này" });
    }

    participant.isHidden = isHidden;

    await conversation.save();

    return res.status(200).json({
      message: isHidden
        ? "Ẩn cuộc trò chuyện thành công"
        : "Bỏ ẩn cuộc trò chuyện thành công",
      conversationId,
      isHidden,
    });
  } catch (err) {
    console.error("Lỗi khi ẩn/hiện cuộc trò chuyện", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const uploadGroupAvatar = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const file = req.file;
    const userId = req.user._id.toString();

    if (!file) {
      return res.status(400).json({ message: "Không có file tải lên" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Cuộc trò chuyện không tồn tại" });
    }

    if (conversation.type !== "group") {
      return res
        .status(400)
        .json({ message: "Chỉ có thể đổi ảnh đại diện cho nhóm chat" });
    }

    const participant = conversation.participants.find(
      (p) => p.userId.toString() === userId,
    );
    if (!participant) {
      return res.status(403).json({ message: "Bạn không tham gia nhóm này" });
    }

    const result = await uploadImageFromBuffer(file.buffer);

    conversation.group.avatarUrl = result.secure_url;
    conversation.group.avatarId = result.public_id;
    await conversation.save();

    await conversation.populate([
      {
        path: "participants.userId",
        select: "username displayName avatarUrl",
      },
      { path: "seenBy", select: "displayName avatarUrl" },
      { path: "lastMessage.senderId", select: "displayName avatarUrl" },
    ]);

    const participants = conversation.participants.map((p) => ({
      _id: p.userId?._id,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
      role: p.role,
    }));

    const formatted = { ...conversation.toObject(), participants };

    io.to(conversationId).emit("group-updated", formatted);

    return res.status(200).json({
      message: "Cập nhật ảnh đại diện nhóm thành công",
      conversation: formatted,
    });
  } catch (err) {
    console.error("Lỗi khi upload ảnh đại diện nhóm", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getAllGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({
      type: "group",
      "participants.userId": userId,
    })
      .sort({ updatedAt: -1 })
      .populate({
        path: "participants.userId",
        select: "displayName avatarUrl",
      })
      .populate({
        path: "lastMessage.senderId",
        select: "displayName avatarUrl",
      })
      .populate({
        path: "seenBy",
        select: "displayName avatarUrl",
      });

    const formatted = conversations.map((convo) => {
      const participants = (convo.participants || []).map((p) => ({
        _id: p.userId?._id,
        displayName: p.userId?.displayName,
        avatarUrl: p.userId?.avatarUrl ?? null,
        joinedAt: p.joinedAt,
        role: p.role,
      }));

      return {
        ...convo.toObject(),
        unreadCounts: convo.unreadCounts || {},
        participants,
      };
    });

    return res.status(200).json({ conversations: formatted });
  } catch (err) {
    console.error("Lỗi khi lấy all groups", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Cuộc trò chuyện không tồn tại" });
    }

    if (conversation.type !== "group") {
      return res.status(400).json({ message: "Chỉ có thể rời khỏi nhóm chat" });
    }

    const participant = conversation.participants.find(
      (p) => p.userId.toString() === userId,
    );

    if (!participant) {
      return res.status(403).json({ message: "Bạn không ở trong nhóm này" });
    }

    if (participant.role === "admin") {
      const otherParticipants = conversation.participants.filter(
        (p) => p.userId.toString() !== userId,
      );
      if (otherParticipants.length > 0) {
        return res.status(400).json({
          message:
            "Bạn là trưởng nhóm. Hãy chuyển quyền trưởng nhóm cho thành viên khác trước khi rời nhóm.",
        });
      }
    }

    conversation.participants = conversation.participants.filter(
      (p) => p.userId.toString() !== userId,
    );

    await conversation.save();

    await conversation.populate([
      {
        path: "participants.userId",
        select: "username displayName avatarUrl",
      },
      { path: "seenBy", select: "displayName avatarUrl" },
      { path: "lastMessage.senderId", select: "displayName avatarUrl" },
    ]);

    const formattedParticipants = conversation.participants.map((p) => ({
      _id: p.userId?._id,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
      role: p.role,
    }));

    const formatted = {
      ...conversation.toObject(),
      participants: formattedParticipants,
    };

    io.to(conversationId).emit("group-updated", formatted);
    io.to(userId).emit("group-left", { conversationId });

    return res.status(200).json({ message: "Rời nhóm thành công" });
  } catch (err) {
    console.error("Lỗi khi rời nhóm", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const transferAdmin = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { newAdminId } = req.body;
    const userId = req.user._id.toString();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Cuộc trò chuyện không tồn tại" });
    }

    if (conversation.type !== "group") {
      return res
        .status(400)
        .json({ message: "Chỉ có thể chuyển trưởng nhóm cho nhóm chat" });
    }

    const currentAdmin = conversation.participants.find(
      (p) => p.userId.toString() === userId && p.role === "admin",
    );

    if (!currentAdmin) {
      return res.status(403).json({
        message: "Chỉ có trưởng nhóm mới có quyền chuyển trưởng nhóm",
      });
    }

    const targetUser = conversation.participants.find(
      (p) => p.userId.toString() === newAdminId,
    );

    if (!targetUser) {
      return res.status(400).json({
        message: "Người nhận quyền trưởng nhóm không ở trong nhóm này",
      });
    }

    currentAdmin.role = "member";
    targetUser.role = "admin";
    conversation.group.createdBy = newAdminId;

    await conversation.save();

    await conversation.populate([
      {
        path: "participants.userId",
        select: "username displayName avatarUrl",
      },
      { path: "seenBy", select: "displayName avatarUrl" },
      { path: "lastMessage.senderId", select: "displayName avatarUrl" },
    ]);

    const formattedParticipants = conversation.participants.map((p) => ({
      _id: p.userId?._id,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
      role: p.role,
    }));

    const formatted = {
      ...conversation.toObject(),
      participants: formattedParticipants,
    };

    io.to(conversationId).emit("group-updated", formatted);

    return res.status(200).json({
      message: "Chuyển quyền trưởng nhóm thành công",
      conversation: formatted,
    });
  } catch (err) {
    console.error("Lỗi khi chuyển quyền trưởng nhóm", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const addGroupMembers = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { memberIds } = req.body;
    const userId = req.user._id.toString();

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Danh sách thành viên không hợp lệ" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Cuộc trò chuyện không tồn tại" });
    }

    if (conversation.type !== "group") {
      return res
        .status(400)
        .json({ message: "Chỉ có thể thêm thành viên vào nhóm chat" });
    }

    const requester = conversation.participants.find(
      (p) => p.userId.toString() === userId,
    );
    if (!requester) {
      return res.status(403).json({ message: "Bạn không ở trong nhóm này" });
    }

    const existingIds = new Set(
      conversation.participants.map((p) => p.userId.toString()),
    );

    const newMemberIds = memberIds.filter(
      (id) => !existingIds.has(id.toString()),
    );

    if (newMemberIds.length === 0) {
      return res.status(400).json({
        message: "Tất cả người được chọn đã ở trong nhóm",
      });
    }

    newMemberIds.forEach((id) => {
      conversation.participants.push({ userId: id, role: "member" });
      conversation.unreadCounts.set(id.toString(), 0);
    });

    await conversation.save();

    await conversation.populate([
      {
        path: "participants.userId",
        select: "username displayName avatarUrl",
      },
      { path: "seenBy", select: "displayName avatarUrl" },
      { path: "lastMessage.senderId", select: "displayName avatarUrl" },
    ]);

    const participants = conversation.participants.map((p) => ({
      _id: p.userId?._id,
      username: p.userId?.username,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
      role: p.role,
    }));

    const formatted = { ...conversation.toObject(), participants };

    io.to(conversationId).emit("group-updated", formatted);
    newMemberIds.forEach((memberId) => {
      io.to(memberId.toString()).emit("new-group", formatted);
    });

    return res.status(200).json({
      message: "Thêm thành viên thành công",
      conversation: formatted,
    });
  } catch (err) {
    console.error("Lỗi khi thêm thành viên vào nhóm", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Cuộc trò chuyện không tồn tại" });
    }

    if (conversation.type !== "group") {
      return res.status(400).json({ message: "Chỉ có thể xóa nhóm chat" });
    }

    const admin = conversation.participants.find(
      (p) => p.userId.toString() === userId && p.role === "admin",
    );

    if (!admin) {
      return res
        .status(403)
        .json({ message: "Chỉ có trưởng nhóm mới có quyền xóa nhóm" });
    }

    await Conversation.findByIdAndDelete(conversationId);
    await Message.deleteMany({ conversationId });

    io.to(conversationId).emit("group-deleted", { conversationId });

    return res.status(200).json({ message: "Xóa nhóm chat thành công" });
  } catch (err) {
    console.error("Lỗi khi xóa nhóm chat", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
