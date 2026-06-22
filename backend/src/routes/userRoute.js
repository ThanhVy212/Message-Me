import express from "express";
import {
  addPassword,
  authMe,
  changePassword,
  getUserProfile,
  searchUserByUsername,
  updateProfile,
  uploadAvatar,
} from "../controllers/userController.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/me", authMe);
router.get("/search", searchUserByUsername);
router.get("/profile/:userId", getUserProfile);
router.post("/uploadAvatar", upload.single("file"), uploadAvatar);
router.post("/add-password", addPassword);
router.post("/change-password", changePassword);
router.put("/update-profile", updateProfile);

export default router;
