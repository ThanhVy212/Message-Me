import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware.js";
import User from "../models/User.js";

export const authMe = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({ user });
  } catch (err) {
    console.error("Lỗi khi gọi authMe", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const searchUserByUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username.trim() === "") {
      return res
        .status(400)
        .json({ message: "Cần cung cấp username trong query." });
    }

    const user = await User.findOne({ username }).select(
      "_id displayName userName avatarUrl",
    );

    return res.status(200).json({ user });
  } catch (err) {
    console.error("Lỗi khi gọi searchUserByUsername", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user._id;

    if (!file) {
      return res.status(400).json({ message: "Không có file tải lên" });
    }

    const result = await uploadImageFromBuffer(file.buffer);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        avatarUrl: result.secure_url,
        avatarId: result.public_id,
      },
      {
        new: true,
      },
    ).select("avatarUrl");

    if (!updatedUser.avatarUrl) {
      return res.status(400).json({ message: "Avatar trả về null" });
    }

    return res.status(200).json({ avatarUrl: updatedUser.avatarUrl });
  } catch (err) {
    console.error("Lỗi xảy ra khi upload avatar lên cloudinary");
    return res.status(500).json({ message: "Upload failed" });
  }
};
