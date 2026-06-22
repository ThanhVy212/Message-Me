import express from "express";
import {
  sendDirectMessage,
  sendGroupMessage,
  recallMessage,
  deleteMessageMySide,
} from "../controllers/messageCotroller.js";
import {
  checkFriendship,
  checkGroupMembership,
} from "../middlewares/friendMiddleware.js";

const router = express.Router();

router.post("/direct", checkFriendship, sendDirectMessage);
router.post("/group", checkGroupMembership, sendGroupMessage);
router.post("/:messageId/recall", recallMessage);
router.post("/:messageId/delete-my-side", deleteMessageMySide);

export default router;
