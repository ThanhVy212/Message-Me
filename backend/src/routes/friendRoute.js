import express from "express";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  getAllFriends,
  getFriendRequests,
  sendFriendRequest,
} from "../controllers/friendController.js";

const router = express.Router();

router.post("/requests", sendFriendRequest);

router.post("/requests/:requestId/accept", acceptFriendRequest);
router.post("/requests/:requestId/cancel", cancelFriendRequest);
router.post("/requests/:requestId/decline", declineFriendRequest);

router.get("/", getAllFriends);
router.get("/requests", getFriendRequests);

export default router;
