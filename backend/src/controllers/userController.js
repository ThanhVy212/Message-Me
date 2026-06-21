import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

export const authMe = async (req, res) => {
  try {
    const user = req.user;
    const userWithPw = await User.findById(user._id).select("+hashedPassword");
    const hasPassword = !!userWithPw.hashedPassword;

    const userJson = user.toObject();
    userJson.hasPassword = hasPassword;

    return res.status(200).json({ user: userJson });
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

export const addPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user._id;

    if (!password) {
      return res.status(400).json({ message: "Mật khẩu không thể thiếu" });
    }

    const user = await User.findById(userId).select("+hashedPassword");
    if (user.hashedPassword) {
      return res.status(400).json({ message: "Tài khoản đã có mật khẩu" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.hashedPassword = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Thêm mật thành công" });
  } catch (err) {
    console.error("Lỗi khi addPassword", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Cần đầy đủ thông tin mật khẩu cũ và mới" });
    }
    const user = await User.findById(userId).select("+hashedPassword");
    if (!user.hashedPassword) {
      return res.status(400).json({
        message: "Tài khoản chưa có mật khẩu",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.hashedPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.hashedPassword = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("Lỗi khi changePassword", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { displayName, bio, phone } = req.body;
    const userId = req.user._id;

    if (!displayName || displayName.trim() === "") {
      return res
        .status(400)
        .json({ message: "Tên hiển thị không được để trống" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { displayName, bio, phone },
      { new: true },
    );

    const userJson = updatedUser.toObject();

    const userWithPw = await User.findById(userId).select("+hashedPassword");
    userJson.hasPassword = !!userWithPw.hashedPassword;

    return res.status(200).json({
      message: "Cập nhật thông tin cá nhân thành công",
      user: userJson,
    });
  } catch (err) {
    console.error("Lỗi khi updateProfile", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
