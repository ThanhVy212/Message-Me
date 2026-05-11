import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
    console.log("Liên kết cơ sở dữ liệu thành công!");
  } catch (err) {
    console.log("Lỗi kết nối cơ sở dữ liệu", err);
    process.exit(1);
  }
};
