import express from "express";
import {
  sendDirectMessage,
  sendGroupMessage,
  recallMessage,
  deleteMessageMySide,
  uploadMessageImage,
} from "../controllers/messageCotroller.js";
import {
  checkFriendship,
  checkGroupMembership,
} from "../middlewares/friendMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/direct", checkFriendship, sendDirectMessage);
router.post("/group", checkGroupMembership, sendGroupMessage);
router.post("/:messageId/recall", recallMessage);
router.post("/:messageId/delete-my-side", deleteMessageMySide);
router.post("/upload-image", upload.single("file"), uploadMessageImage);

export default router;
