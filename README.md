<div align="center">

# 🏠 Airbnb Clone — Backend API

<p>
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/BullMQ-FF6B6B?style=for-the-badge&logo=bull&logoColor=white" />
  <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black" />
</p>

<p>
  <b>Production-ready RESTful API</b> cho nền tảng đặt phòng trực tuyến Airbnb Clone.<br/>
  Được xây dựng với kiến trúc module hoá, bảo mật theo chuẩn enterprise và hỗ trợ xử lý bất đồng bộ.
</p>

**🌐 Live Demo:** [https://airbnb-cyber.onrender.com](https://airbnb-cyber.onrender.com)  
**📖 API Docs:** [https://airbnb-cyber.onrender.com/swagger](https://airbnb-cyber.onrender.com/swagger)

</div>

---

## 📋 Mục lục

- [Giới thiệu dự án](#-giới-thiệu-dự-án)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Tính năng nổi bật](#-tính-năng-nổi-bật)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Endpoints](#-api-endpoints)
- [Cài đặt và chạy local](#-cài-đặt-và-chạy-local)
- [Biến môi trường](#-biến-môi-trường)
- [Deployment](#-deployment)
- [Tác giả](#-tác-giả)

---

## 🎯 Giới thiệu dự án

Đây là dự án **Capstone cuối khóa** — một backend API hoàn chỉnh mô phỏng hệ thống đặt phòng Airbnb, bao gồm:

- Quản lý người dùng, phòng thuê, vị trí, đặt phòng và bình luận
- Hệ thống xác thực bảo mật với **JWT Access Token + Refresh Token** lưu trong HTTP-Only Cookie
- Phân quyền theo vai trò (ADMIN / USER) với **RolesGuard**
- Xử lý bất đồng bộ gửi email xác nhận sau khi đặt phòng thành công
- Cache dữ liệu với **Redis** (Upstash) để tối ưu hiệu năng
- Upload ảnh lên **Cloudinary** cho avatar và hình phòng
- Deploy production lên **Render** với CI/CD tự động qua GitHub

---

## 🏗 Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│              (Swagger UI / Postman / Frontend)              │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────────┐
│                   NestJS API Server                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │   Auth   │  │  Users   │  │  Rooms   │  │ Bookings  │  │
│  │  Module  │  │  Module  │  │  Module  │  │  Module   │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘  │
│  ┌──────────┐  ┌──────────┐                                 │
│  │Comments  │  │Locations │  Guards · Interceptors · Pipes  │
│  │  Module  │  │  Module  │  (JWT · Roles · Response · Log) │
│  └──────────┘  └──────────┘                                 │
└──────┬─────────────────┬──────────────────────┬────────────┘
       │                 │                      │
┌──────▼──────┐  ┌───────▼───────┐    ┌────────▼────────┐
│ PostgreSQL  │  │ Redis/Upstash │    │   Cloudinary    │
│  (Prisma)   │  │  Cache+Queue  │    │  (Image Store)  │
│  Supabase   │  │               │    │                 │
└─────────────┘  └───────────────┘    └─────────────────┘
                        │
               ┌────────▼────────┐
               │  Gmail SMTP     │
               │ (Email Notify)  │
               └─────────────────┘
```

---

## 🛠 Công nghệ sử dụng

| Layer | Công nghệ |
|---|---|
| **Framework** | NestJS v10 + TypeScript |
| **ORM** | Prisma v7 (với PrismaPg adapter) |
| **Database** | PostgreSQL (Supabase) |
| **Cache** | Redis (Upstash) + `@nestjs/cache-manager` + Keyv |
| **Email** | Nodemailer + `@nestjs-modules/mailer` (Gmail SMTP) |
| **Queue** | BullMQ + `@nestjs/bullmq` (Upstash Redis) |
| **Auth** | JWT (Passport.js) — Access Token 15m + Refresh Token 7d |
| **Cookie** | `cookie-parser` — HTTP-Only Cookie cho Refresh Token |
| **Upload** | Cloudinary SDK + Multer |
| **Docs** | Swagger UI (`@nestjs/swagger`) |
| **Validation** | `class-validator` + `class-transformer` |
| **Deploy** | Render (Web Service) + GitHub Actions |

---

## ✨ Tính năng nổi bật

### 🔐 Bảo mật & Xác thực
- **Dual Token Strategy:** Access Token (15 phút) + Refresh Token (7 ngày)
- Refresh Token được **hash bằng bcrypt** và lưu vào database, không thể bị tái sử dụng
- Refresh Token truyền qua **HTTP-Only Cookie** — chống XSS hoàn toàn
- Endpoint `/api/auth/refresh` để gia hạn phiên mà không cần đăng nhập lại
- Endpoint `/api/auth/logout` xoá cookie và thu hồi token
- **RolesGuard + `@Roles()` decorator** phân quyền ADMIN / USER

### 📧 Email Notification (Bất đồng bộ)
- Sau khi đặt phòng thành công, hệ thống gửi email xác nhận qua Gmail SMTP
- Sử dụng pattern **fire-and-forget với `setImmediate()`** — response API trả về ngay lập tức, không block chờ email
- Email chứa đầy đủ thông tin: tên phòng, ngày đến/đi, số khách, giá tiền

### ⚡ Caching với Redis
- Cache danh sách người dùng (TTL 60 giây) — giảm tải database
- Dual-layer cache: **In-Memory** (KeyvCacheableMemory) + **Redis** (Upstash) — đảm bảo fallback khi Redis gặp sự cố

### 🖼 Upload ảnh
- Upload avatar người dùng và hình ảnh phòng/vị trí lên **Cloudinary**
- Trả về URL ảnh ổn định, tối ưu CDN toàn cầu

### 📄 Soft Delete
- Tất cả models đều hỗ trợ **Soft Delete** (trường `isDeleted`, `deletedAt`, `deletedBy`)
- Dữ liệu không bị xóa vật lý — đảm bảo toàn vẹn lịch sử

---

## 📁 Cấu trúc dự án

```
src/
├── app.module.ts              # Root module (BullMQ, Mailer, Cache)
├── app.controller.ts          # Landing page → redirect /swagger
├── common/
│   ├── constants/             # App-level constants (env vars)
│   ├── decorators/            # @Roles() custom decorator
│   ├── guards/                # RolesGuard
│   ├── interceptors/          # LoggingInterceptor, ResponseSuccessInterceptor
│   ├── prisma/                # PrismaService (Supabase PostgreSQL)
│   ├── cloudinary/            # CloudinaryService
│   └── redis/
│       ├── redis.module.ts    # CacheModule config (Keyv + Upstash)
│       └── redis.service.ts   # RedisService (set/get/delete)
└── modules/
    ├── auth/                  # Signup, Signin, Refresh, Logout + JwtStrategy
    ├── user/                  # CRUD người dùng + upload avatar
    ├── location/              # CRUD vị trí + upload hình
    ├── room/                  # CRUD phòng thuê + upload hình
    ├── booking/               # Đặt phòng + gửi email xác nhận
    └── comment/               # Bình luận & đánh giá phòng
```

---

## 📡 API Endpoints

> Xem đầy đủ tại: [https://airbnb-cyber.onrender.com/swagger](https://airbnb-cyber.onrender.com/swagger)

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/auth/signup` | Đăng ký tài khoản |
| `POST` | `/api/auth/signin` | Đăng nhập (trả về `accessToken` + set `refreshToken` cookie) |
| `POST` | `/api/auth/refresh` | Làm mới Access Token từ Refresh Token cookie |
| `POST` | `/api/auth/logout` | Đăng xuất (xóa cookie) |

### Người dùng
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/users` | Danh sách người dùng (có cache) | ❌ |
| `POST` | `/api/users` | Thêm người dùng | 🔐 ADMIN |
| `DELETE` | `/api/users?id=` | Xóa người dùng | 🔐 ADMIN |
| `GET` | `/api/users/:id` | Thông tin người dùng | ❌ |
| `PUT` | `/api/users/:id` | Cập nhật người dùng | 🔐 |
| `POST` | `/api/users/upload-avatar` | Upload avatar | 🔐 |
| `GET` | `/api/users/phan-trang-tim-kiem` | Tìm kiếm phân trang | ❌ |

### Phòng thuê
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/phong-thue` | Danh sách phòng |
| `POST` | `/api/phong-thue` | Thêm phòng 🔐 ADMIN |
| `GET` | `/api/phong-thue/:id` | Chi tiết phòng |
| `PUT` | `/api/phong-thue/:id` | Cập nhật phòng 🔐 ADMIN |
| `DELETE` | `/api/phong-thue/:id` | Xóa phòng 🔐 ADMIN |
| `POST` | `/api/phong-thue/upload-hinh-phong` | Upload hình phòng 🔐 |

### Đặt phòng
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/dat-phong` | Danh sách đặt phòng 🔐 |
| `POST` | `/api/dat-phong` | Tạo đặt phòng + **gửi email xác nhận** 🔐 |
| `GET` | `/api/dat-phong/:id` | Chi tiết đặt phòng 🔐 |
| `PUT` | `/api/dat-phong/:id` | Cập nhật đặt phòng 🔐 |
| `DELETE` | `/api/dat-phong/:id` | Xóa đặt phòng 🔐 |

### Bình luận & Vị trí
- **`/api/binh-luan`** — CRUD bình luận và đánh giá sao (1–5)
- **`/api/vi-tri`** — CRUD vị trí, upload hình vị trí

---

## 🚀 Cài đặt và chạy local

### Yêu cầu
- Node.js >= 18
- npm >= 9

### Các bước

```bash
# 1. Clone repository
git clone https://github.com/Dton04/Airbnb_cyber.git
cd Airbnb_cyber/project-airbnb

# 2. Cài đặt dependencies
npm install

# 3. Tạo file .env (xem mục Biến môi trường)
cp .env.example .env

# 4. Generate Prisma Client
npx prisma generate

# 5. Chạy development server
npm run start:dev
```

Truy cập:
- **API Server:** http://localhost:3069
- **Swagger UI:** http://localhost:3069/swagger

---

## ⚙️ Biến môi trường

Tạo file `.env` tại root của `project-airbnb/`:

```env
# Database (PostgreSQL - Supabase/Prisma Accelerate)
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your_jwt_secret_key
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Redis (Upstash)
REDIS_URL=redis://default:PASSWORD@HOST.upstash.io:6379

# Email (Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=3069
NODE_ENV=development
```

> **Lưu ý Gmail:** Bật xác minh 2 bước và tạo **App Password** tại [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

---

## 🌍 Deployment

Dự án được deploy tự động lên **Render** khi push lên nhánh `main`.

### Cấu hình Render
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start:prod`
- **Environment:** Khai báo đầy đủ các biến môi trường trong tab **Environment** của Render

### Infrastructure
| Service | Provider | Gói |
|---------|----------|-----|
| **Web Server** | Render | Free |
| **PostgreSQL** | Supabase / Prisma Accelerate | Free |
| **Redis** | Upstash | Free (Singapore) |
| **Image CDN** | Cloudinary | Free |
| **Email** | Gmail SMTP | Free |

---

## 👨‍💻 Tác giả

**Tấn Đạt** — Học viên Cybersoft  
📧 tandat081104@gmail.com  
🐙 GitHub: [github.com/Dton04](https://github.com/Dton04)

---

<div align="center">
  <i>Dự án Capstone cuối khóa — Cybersoft Academy</i>
</div>

