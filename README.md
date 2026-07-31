# 💬 Message Me

Một ứng dụng nhắn tin thời gian thực đầy đủ tính năng với giao diện hiện đại và thân thiện.

## ✨ Tính năng

- 🔐 **Xác thực người dùng**
  - Đăng ký/Đăng nhập bằng email và mật khẩu
  - Đăng nhập bằng Google OAuth
  - Quản lý phiên bảo mật với JWT

- 💬 **Nhắn tin thời gian thực**
  - Nhắn tin trực tiếp (Direct Message)
  - Nhóm chat
  - Nhận tin nhắn tức thì qua Socket.io
  - Hỗ trợ emoji
  - Chia sẻ hình ảnh

- 👥 **Quản lý bạn bè**
  - Gửi lời mời kết bạn
  - Chấp nhận/Từ chối lời mời
  - Danh sách bạn bè
  - Xem trạng thái trực tuyến

- 👤 **Hồ sơ người dùng**
  - Cập nhật thông tin cá nhân
  - Tải lên avatar
  - Tùy chỉnh giao diện (Dark/Light mode)

- 🎨 **Giao diện hiện đại**
  - Thiết kế responsive
  - Dark mode
  - Animations mượt mà
  - Trải nghiệm người dùng tốt

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Passport** - Authentication middleware
- **Cloudinary** - Image storage
- **Multer** - File upload

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn UI** - UI components
- **Zustand** - State management
- **Socket.io Client** - Real-time client
- **React Router** - Routing
- **Axios** - HTTP client

## 📦 Cài đặt

### Yêu cầu
- Node.js (v18+)
- MongoDB
- npm hoặc yarn

### Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục backend:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/message-me
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Chạy server:

```bash
npm run dev
```

### Cài đặt Frontend

```bash
cd frontend
npm install
```

Tạo file `.env.development` trong thư mục frontend:

```env
VITE_API_URL=http://localhost:5000
```

Chạy client:

```bash
npm run dev
```

## 🚀 Sử dụng

1. Mở browser và truy cập `http://localhost:5173`
2. Đăng ký tài khoản mới hoặc đăng nhập
3. Thêm bạn bè bằng cách tìm kiếm username
4. Bắt đầu nhắn tin!

## 📁 Cấu trúc dự án

```
message-me/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Xử lý logic
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middlewares/   # Custom middlewares
│   │   ├── socket/        # Socket.io setup
│   │   └── utils/         # Utility functions
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # Zustand stores
│   │   └── assets/        # Static assets
│   └── package.json
└── README.md
```

## 🤝 Đóng góp

Các đóng góp được chào đón! Vui lòng tạo pull request hoặc báo lỗi.

## 📄 Giấy phép

ISC

---

Made with ❤️ by TVyj
