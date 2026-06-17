import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import friendRoute from "./routes/friendRoute.js";
import messageRoute from "./routes/messageRoute.js";
import conversationRoute from "./routes/conversationRoute.js";
import cookieParser from "cookie-parser";
import { protectedRoute } from "./middlewares/authMiddleware.js";
import cors from "cors";
import passport from "./libs/passport.js";
import { app, server } from "./socket/index.js";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const PORT = process.env.PORT;

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(passport.initialize());

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//public route
app.use("/api/auth", authRoute);

//private route
app.use("/api/users", protectedRoute, userRoute);
app.use("/api/friends", protectedRoute, friendRoute);
app.use("/api/messages", protectedRoute, messageRoute);
app.use("/api/conversations", protectedRoute, conversationRoute);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`server bắt đầu trên cổng ${PORT}`);
  });
});
