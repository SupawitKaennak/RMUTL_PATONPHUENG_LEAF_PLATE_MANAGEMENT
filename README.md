# RMUTL Leaf Plate Management

ระบบจัดการวัตถุดิบ ผลิตภัณฑ์ ออเดอร์ และรายรับ–รายจ่าย สำหรับการผลิต “จานใบตองตึง” พร้อมมาตรการความปลอดภัยตามแนวทาง OWASP

## ภาพรวมความสามารถหลัก

- 📦 วัตถุดิบ (Materials): เพิ่ม/แก้ไข/ลบ, ปรับจำนวน, บันทึกประวัติการเคลื่อนไหว
- 📋 ออเดอร์ (Orders): เพิ่ม/แก้ไข/ลบ, คำนวณการใช้วัตถุดิบตามสูตร, อัพเดตต้นทุน
- 💰 รายรับ–รายจ่าย (Transactions): บันทึก/แก้ไข/ลบ, สรุปผลรวม
- 📊 รายงาน (Reports): ดูภาพรวมการผลิตและต้นทุน (หน้า UI)
- 🔐 ผู้ใช้ (Auth): สมัครสมาชิก/เข้าสู่ระบบ/ออกจากระบบ, ป้องกันหน้าที่ต้องล็อกอิน

## ความปลอดภัยที่มีอยู่ (สรุป)

- JWT ในคุกกี้ HttpOnly + อายุ 30 นาที (auto logout เมื่อหมดอายุ)
- CSRF ป้องกันแบบ Double-Submit Cookie (`csrfToken` + header `X-CSRF-Token`)
- Helmet + Security headers (CSP, X-Frame-Options, Referrer-Policy, ฯลฯ)
- HPP (HTTP Parameter Pollution) และ CORS แบบ whitelist
- Rate limiting รวมถึงสาขาเข้มงวดสำหรับ `/api/auth/*` และ lockout ชั่วคราวเมื่อเดารหัสผ่านผิดซ้ำ
- Validation ด้วย Joi ในทุก endpoint สำคัญ (รวม PUT/DELETE)
- Audit log เหตุการณ์สำคัญ (login success/failure/locked)

## โครงสร้างโปรเจกต์

- `back-end/` Express + Firebase Admin (REST API)
- `front-end/` Next.js + Tailwind + shadcn/ui (UI)

## ติดตั้งและรัน

### Backend
1) ติดตั้งแพ็กเกจ
```bash
cd back-end
npm install
```
2) ตั้งค่าไฟล์ `.env` (ดูตัวอย่างใน `back-end/env.example`)
ค่าที่สำคัญ:
```
JWT_SECRET=your-long-random-secret
ALLOWED_ORIGINS=http://localhost:3000
PORT=8000
NODE_ENV=development
# Firebase service account ...
```
3) รัน
```bash
npm run dev
```

### Frontend
1) ติดตั้งแพ็กเกจ
```bash
cd front-end
npm install
```
2) ตั้งค่า `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
3) รัน
```bash
npm run dev
```

## API สำคัญ

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/auth/csrf` ออกคุกกี้ `csrfToken`

### Materials
- `GET /api/materials`
- `POST /api/materials`
- `PUT /api/materials/:id`
- `PATCH /api/materials/update-unit`
- `POST /api/materials/quantity`
- `DELETE /api/materials/:id`

### Orders
- `GET /api/orders`
- `POST /api/orders`
- `PUT /api/orders/:id`
- `POST /api/orders/production`
- `DELETE /api/orders/:id`

### Transactions
- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

## หมายเหตุด้านความปลอดภัย (ใช้งานจริง)

- เปิดใช้งาน HTTPS และตั้งค่า `secure: true` ให้คุกกี้ทุกตัวใน production
- ปรับ `ALLOWED_ORIGINS` เป็นโดเมนจริง ไม่ใช้ `*`
- พิจารณาใช้ Redis สำหรับเก็บ lockout แทน in‑memory
- ตรวจทาน/ปรับ CSP ให้ตรงกับโดเมนและทรัพยากรจริงในโปรดักชัน

## สคริปต์พัฒนา

Backend
```bash
npm run dev    # โหมดพัฒนา
npm run build  # คอมไพล์ TypeScript
npm start      # รันโปรดักชันจาก dist/
```

Frontend
```bash
npm run dev
npm run build
npm start
```

## อัปเดตล่าสุด (ย่อ)

- เพิ่ม HPP, CORS แบบ whitelist, Helmet, Security headers
- เพิ่ม CSRF double submit + bootstrap endpoint
- เพิ่ม Rate limit + Login lockout + Audit log
- ขยาย Joi validation สำหรับ PUT/DELETE
