# JWT Configuration Guide

## การตั้งค่า JWT Secret

### 1. สร้างไฟล์ .env

```bash
cd back-end
npm run generate-env
```

หรือคัดลอกไฟล์ `env.example` และเปลี่ยนชื่อเป็น `.env`:

```bash
cp env.example .env
```

### 2. แก้ไข JWT Secret

เปิดไฟล์ `.env` และแก้ไข:

```bash
# เปลี่ยนจาก
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production-12345678901234567890

# เป็นค่าที่ปลอดภัย (อย่างน้อย 32 ตัวอักษร)
JWT_SECRET=your-actual-secure-jwt-secret-key-here-12345678901234567890
```

### 3. แก้ไข Firebase Configuration

ในไฟล์ `.env` แก้ไขค่า Firebase:

```bash
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_PRIVATE_KEY_ID=your-actual-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Actual Private Key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-actual-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-actual-client-id
```

### 4. ตรวจสอบการตั้งค่า

รันเซิร์ฟเวอร์และตรวจสอบ:

```bash
npm run dev
```

คุณควรเห็น:

```
🚀 Server running on port 8000
🌍 Environment: development
🔒 JWT Secret configured: Yes
🔐 JWT Expires In: 30m
🌐 CORS Origins: http://localhost:3000, http://127.0.0.1:3000
```

## การใช้งาน Scripts

### Generate JWT Secret เท่านั้น
```bash
npm run generate-jwt-secret
```

### Generate ไฟล์ .env ทั้งหมด
```bash
npm run generate-env
```

### Setup โปรเจคใหม่
```bash
npm run setup
```

## Security Best Practices

### 1. JWT Secret
- ต้องมีอย่างน้อย 32 ตัวอักษร
- ใช้ตัวอักษรและตัวเลขผสมกัน
- ไม่ใช้ค่าเดียวกันใน production และ development

### 2. Environment Variables
- อย่า commit ไฟล์ `.env` ลง git
- ใช้ `.env.example` เป็น template
- ตั้งค่า environment variables ใน production server

### 3. Production Setup
```bash
# ใน production server
export JWT_SECRET="your-super-secure-production-jwt-secret"
export NODE_ENV="production"
export FIREBASE_PROJECT_ID="your-production-project-id"
# ... other variables
```

## Troubleshooting

### Error: Missing required environment variables
ตรวจสอบว่าไฟล์ `.env` มีอยู่และมีตัวแปรที่จำเป็น:

```bash
# ตรวจสอบไฟล์ .env
cat .env | grep JWT_SECRET
cat .env | grep FIREBASE_PROJECT_ID
```

### Error: JWT_SECRET should be at least 32 characters
แก้ไข JWT_SECRET ให้ยาวขึ้น:

```bash
# ใน .env
JWT_SECRET=your-super-secure-jwt-secret-key-here-12345678901234567890
```

### Error: Invalid or expired token
ตรวจสอบว่า JWT_SECRET ใน `.env` ตรงกับที่ใช้สร้าง token

## การอัปเดต JWT Secret

หากต้องการเปลี่ยน JWT Secret:

1. แก้ไขใน `.env`
2. รีสตาร์ทเซิร์ฟเวอร์
3. ผู้ใช้ทั้งหมดต้อง login ใหม่

```bash
# แก้ไข .env
JWT_SECRET=new-secret-key-here

# รีสตาร์ทเซิร์ฟเวอร์
npm run dev
```
