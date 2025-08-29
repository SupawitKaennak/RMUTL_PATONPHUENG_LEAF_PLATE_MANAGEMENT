# RMUTL_PATONPHUENG_LEAF_PLATE_MANAGEMENT

ระบบจัดการใบตองสำหรับการผลิตแผ่นใบตองของมหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา

## Features

- 🔐 **Authentication System** - ระบบเข้าสู่ระบบและลงทะเบียนด้วย JWT
- 📦 **Material Management** - จัดการวัตถุดิบ
- 📋 **Order Management** - จัดการคำสั่งซื้อ
- 💰 **Income-Expense Tracking** - ติดตามรายได้และรายจ่าย
- 📊 **Reports & Analytics** - รายงานและกราฟสถิติ
- 🕒 **Auto Logout** - ออกจากระบบอัตโนมัติหลัง 30 นาที
- 🛡️ **Protected Routes** - ป้องกันการเข้าถึงหน้าโดยไม่ได้รับอนุญาต
- 👤 **User Info Display** - แสดงชื่อผู้ใช้งานและปุ่มออกจากระบบในทุกหน้า

## Security Features

- 🔐 JWT Authentication (30 นาที)
- 🔒 Password Hashing (bcrypt)
- 🛡️ CORS Protection
- ⏱️ Rate Limiting
- 🕒 Auto Logout (30 minutes)
- 🔑 Bearer Token Validation
- 🚫 Protected Routes - ทุกหน้าต้อง login ก่อนเข้าถึง
- 🔄 Auto Redirect - redirect ไปหน้า login เมื่อไม่ได้ authenticate

## Installation

### Backend Setup

1. ติดตั้ง dependencies:
```bash
cd back-end
npm install
```

2. สร้างไฟล์ `.env` ในโฟลเดอร์ `back-end`:
```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=8000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=300000
RATE_LIMIT_MAX_REQUESTS=500
```

3. รัน server:
```bash
npm run dev
```

### Frontend Setup

1. ติดตั้ง dependencies:
```bash
cd front-end
npm install
```

2. สร้างไฟล์ `.env.local` ในโฟลเดอร์ `front-end`:
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. รัน development server:
```bash
npm run dev
```

## Environment Variables

### Backend (.env)
- `FIREBASE_PROJECT_ID` - Firebase Project ID
- `FIREBASE_PRIVATE_KEY` - Firebase Private Key
- `FIREBASE_CLIENT_EMAIL` - Firebase Client Email
- `JWT_SECRET` - JWT Secret Key (สำคัญมาก - เปลี่ยนใน production)
- `PORT` - Server Port (default: 8000)
- `ALLOWED_ORIGINS` - CORS Allowed Origins

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

## API Endpoints

### Authentication
- `POST /api/auth/register` - ลงทะเบียนผู้ใช้ใหม่
- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/logout` - ออกจากระบบ
- `GET /api/auth/me` - ตรวจสอบสถานะการเข้าสู่ระบบ

### Materials
- `GET /api/materials` - ดึงข้อมูลวัตถุดิบทั้งหมด
- `POST /api/materials` - เพิ่มวัตถุดิบใหม่
- `PUT /api/materials/:id` - อัปเดตวัตถุดิบ
- `DELETE /api/materials/:id` - ลบวัตถุดิบ

### Orders
- `GET /api/orders` - ดึงข้อมูลคำสั่งซื้อทั้งหมด
- `POST /api/orders` - เพิ่มคำสั่งซื้อใหม่
- `PUT /api/orders/:id` - อัปเดตคำสั่งซื้อ
- `DELETE /api/orders/:id` - ลบคำสั่งซื้อ

### Transactions
- `GET /api/transactions` - ดึงข้อมูลธุรกรรมทั้งหมด
- `POST /api/transactions` - เพิ่มธุรกรรมใหม่
- `PUT /api/transactions/:id` - อัปเดตธุรกรรม
- `DELETE /api/transactions/:id` - ลบธุรกรรม

## Security Features

- 🔐 JWT Authentication (30 นาที)
- 🔒 Password Hashing (bcrypt)
- 🛡️ CORS Protection
- ⏱️ Rate Limiting
- 🕒 Auto Logout (30 minutes)
- 🔑 Bearer Token Validation
- 🚫 Protected Routes - ทุกหน้าต้อง login ก่อนเข้าถึง
- 🔄 Auto Redirect - redirect ไปหน้า login เมื่อไม่ได้ authenticate

## User Interface Features

- 👤 **User Info Display** - แสดงชื่อผู้ใช้งานใน header ทุกหน้า
- 🚪 **Logout Button** - ปุ่มออกจากระบบใน header ทุกหน้า
- 📱 **Responsive Design** - รองรับการใช้งานบนมือถือ
- 🎨 **Modern UI** - ใช้ Tailwind CSS และ Radix UI
- 🔄 **Loading States** - แสดงสถานะการโหลดข้อมูล
- ⚠️ **Error Handling** - จัดการข้อผิดพลาดอย่างเหมาะสม

## Troubleshooting

### Frontend ไม่สามารถเชื่อมต่อ Backend ได้
1. ตรวจสอบว่า backend รันที่ port 8000
2. ตรวจสอบ CORS configuration ใน backend
3. ตรวจสอบ `NEXT_PUBLIC_API_URL` ใน frontend

### JWT Token ไม่ทำงาน
1. ตรวจสอบ `JWT_SECRET` ใน backend
2. ตรวจสอบว่า token หมดอายุหรือไม่ (30 นาที)
3. ตรวจสอบ Authorization header

### Firebase Connection Error
1. ตรวจสอบ Firebase credentials ใน `.env`
2. ตรวจสอบ Firebase project settings
3. ตรวจสอบ service account permissions

### หน้าไม่ redirect ไป login
1. ตรวจสอบ ProtectedRoute component
2. ตรวจสอบ auth context
3. ตรวจสอบ localStorage token

## Development

### Backend Development
```bash
cd back-end
npm run dev  # Development mode with hot reload
npm run build  # Build for production
npm start  # Production mode
```

### Frontend Development
```bash
cd front-end
npm run dev  # Development mode
npm run build  # Build for production
npm start  # Production mode
```

## Recent Updates

### V1.0.2 - Security Improvements
- ✅ แก้ไขช่องโหว่ security - เพิ่ม ProtectedRoute ให้ทุกหน้า
- ✅ เพิ่มชื่อผู้ใช้งานและปุ่มออกจากระบบใน header ทุกหน้า
- ✅ ปรับปรุง JWT authentication flow
- ✅ เพิ่ม auto redirect เมื่อไม่ได้ authenticate
- ✅ ปรับปรุง error handling และ loading states

### V1.0.1 - Authentication System
- ✅ เพิ่มระบบ register และ login
- ✅ JWT token authentication (30 นาที)
- ✅ Auto logout เมื่อ token หมดอายุ
- ✅ Password hashing ด้วย bcrypt
- ✅ Protected routes สำหรับหน้า dashboard

