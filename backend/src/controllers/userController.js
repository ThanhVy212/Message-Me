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
