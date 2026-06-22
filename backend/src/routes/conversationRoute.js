import express from "express";
import {
  createConversation,
  getConversations,
  getMessages,
  markAsSeen,
  deleteConversation,
  hideConversation,
  uploadGroupAvatar,
  getAllGroups,
  leaveGroup,
  transferAdmin,
  deleteGroup,
  addGroupMembers,
} from "../controllers/conversationController.js";
import { checkFriendship } from "../middlewares/friendMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = new express.Router();

router.post("/", checkFriendship, createConversation);
router.get("/", getConversations);
router.get("/all-groups", getAllGroups);
router.get("/:conversationId/messages", getMessages);
router.patch("/:conversationId/seen", markAsSeen);
router.delete("/:conversationId", deleteConversation);
router.patch("/:conversationId/hide", hideConversation);
router.post("/:conversationId/avatar", upload.single("file"), uploadGroupAvatar);
router.post("/:conversationId/members", checkFriendship, addGroupMembers);
router.post("/:conversationId/leave", leaveGroup);
router.post("/:conversationId/transfer-admin", transferAdmin);
router.delete("/:conversationId/group", deleteGroup);

export default router;
