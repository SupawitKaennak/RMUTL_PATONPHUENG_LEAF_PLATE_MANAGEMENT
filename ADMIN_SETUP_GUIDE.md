# คู่มือการตั้งค่าและใช้งาน Admin Panel

## ภาพรวม

ระบบ Admin Panel ได้ถูกเพิ่มเข้าไปในโปรเจค RMUTL Leaf Plate Management เพื่อให้ผู้ดูแลระบบสามารถจัดการผู้ใช้และดูสถิติระบบได้

## ฟีเจอร์ที่มี

### 🔐 ระบบ Role-based Access Control
- **Admin**: สามารถเข้าถึงหน้า admin และจัดการผู้ใช้ได้
- **User**: เข้าถึงได้เฉพาะฟีเจอร์ปกติของระบบ

### 👥 การจัดการผู้ใช้ (User Management)
- ดูรายชื่อผู้ใช้ทั้งหมด
- เพิ่มผู้ใช้ใหม่
- แก้ไขข้อมูลผู้ใช้
- ลบผู้ใช้
- เปลี่ยนบทบาท (Admin/User)
- เปิด/ปิดการใช้งาน
- ค้นหาและกรองผู้ใช้

### 📊 Admin Dashboard
- สถิติผู้ใช้ในระบบ
- ภาพรวมข้อมูลทั้งหมด
- ข้อมูลระบบ (Uptime, Memory Usage)
- กราฟแสดงสัดส่วนผู้ใช้

## การติดตั้งและตั้งค่า

### 1. สร้าง Admin User แรก

เนื่องจากระบบใหม่ไม่มี admin user ให้สร้างด้วยสคริปต์:

```bash
cd back-end
node scripts/create-admin.js admin admin@yourcompany.com yourpassword "System Administrator"
```

หรือใช้ค่าเริ่มต้น:
```bash
cd back-end
node scripts/create-admin.js
```

**ค่าเริ่มต้น:**
- Username: `admin`
- Email: `admin@example.com`
- Password: `admin123`
- Full Name: `System Administrator`


## ใช้ postman สร้าง admin
```
POST http://localhost:8000/api/auth/register
Content-Type: application/json
X-CSRF-Token: [CSRF Token ที่ได้จากขั้นตอนที่ 1]

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "fullName": "ทดสอบ ผู้ใช้"
}
```


### 2. เข้าสู่ระบบเป็น Admin

1. เปิดเว็บไซต์และไปที่หน้า Login
2. เข้าสู่ระบบด้วยข้อมูล admin ที่สร้างไว้
3. คุณจะเห็นเมนู "ผู้ดูแลระบบ" ใน sidebar (สำหรับ admin เท่านั้น)

### 3. เข้าถึง Admin Panel

หลังจากเข้าสู่ระบบเป็น admin แล้ว:

- **Admin Dashboard**: `/admin` - ดูภาพรวมระบบ
- **จัดการผู้ใช้**: `/admin/users` - จัดการผู้ใช้ทั้งหมด

## การใช้งาน

### Admin Dashboard (`/admin`)

แสดงข้อมูลสำคัญ:
- จำนวนผู้ใช้ทั้งหมด (แยกตามบทบาท)
- ข้อมูลในระบบ (Materials, Orders, Transactions)
- สถิติระบบ (Uptime, Memory Usage)
- กราฟแสดงสัดส่วนผู้ใช้

### User Management (`/admin/users`)

#### การค้นหาและกรอง
- **ค้นหา**: ตามชื่อผู้ใช้, อีเมล, หรือชื่อเต็ม
- **กรองตามบทบาท**: Admin หรือ User
- **กรองตามสถานะ**: ใช้งานอยู่ หรือ ปิดใช้งาน

#### การจัดการผู้ใช้
1. **เพิ่มผู้ใช้ใหม่**
   - คลิก "เพิ่มผู้ใช้"
   - กรอกข้อมูลที่จำเป็น
   - เลือกบทบาท (Admin/User)

2. **แก้ไขผู้ใช้**
   - คลิกไอคอน "แก้ไข" ในตาราง
   - แก้ไขข้อมูลที่ต้องการ
   - บันทึกการเปลี่ยนแปลง

3. **ลบผู้ใช้**
   - คลิกไอคอน "ลบ" ในตาราง
   - ยืนยันการลบ

## ความปลอดภัย

### การควบคุมการเข้าถึง
- หน้า admin ถูกป้องกันด้วย middleware `AdminRoute`
- เฉพาะผู้ใช้ที่มี role = 'admin' เท่านั้นที่เข้าถึงได้
- ระบบตรวจสอบสิทธิ์ทั้งฝั่ง backend และ frontend

### Audit Logging
- บันทึกการกระทำสำคัญของ admin:
  - สร้างผู้ใช้ใหม่
  - แก้ไขข้อมูลผู้ใช้
  - ลบผู้ใช้
  - รีเซ็ตรหัสผ่าน

### ข้อจำกัดความปลอดภัย
- Admin ไม่สามารถลบบัญชีตัวเองได้
- ต้องมี admin อย่างน้อย 1 คนในระบบ
- รหัสผ่านถูกเข้ารหัสด้วย bcrypt

## การพัฒนาเพิ่มเติม

### ฟีเจอร์ที่อาจเพิ่มในอนาคต
- **System Logs**: ดูประวัติการใช้งานระบบ
- **Backup & Restore**: จัดการข้อมูล backup
- **Advanced Analytics**: การวิเคราะห์ข้อมูลเชิงลึก
- **Email Notifications**: แจ้งเตือนการเปลี่ยนแปลง
- **Two-Factor Authentication**: เพิ่มความปลอดภัยสำหรับ admin

### การปรับแต่ง
- แก้ไข middleware ใน `back-end/src/middleware/auth.ts`
- เพิ่ม API routes ใน `back-end/src/routes/admin.ts`
- ปรับแต่ง UI ใน `front-end/components/admin-*.tsx`

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **ไม่เห็นเมนู Admin**
   - ตรวจสอบว่าเข้าสู่ระบบเป็น admin แล้ว
   - ตรวจสอบ role ในฐานข้อมูล

2. **เข้าถึงหน้า Admin ไม่ได้**
   - ตรวจสอบว่า role = 'admin' ใน JWT token
   - ตรวจสอบ middleware `requireAdmin`

3. **ไม่สามารถสร้าง admin ได้**
   - ตรวจสอบ Firebase connection
   - ตรวจสอบ service account key

### การ Debug
- ดู console logs ใน browser
- ตรวจสอบ network requests
- ดู server logs

## API Endpoints

### Admin Routes (ต้องเป็น admin)

```
GET    /api/admin/users           - ดึงรายชื่อผู้ใช้ทั้งหมด
GET    /api/admin/users/:id       - ดึงข้อมูลผู้ใช้เฉพาะ
POST   /api/admin/users           - สร้างผู้ใช้ใหม่
PUT    /api/admin/users/:id       - อัปเดตข้อมูลผู้ใช้
DELETE /api/admin/users/:id       - ลบผู้ใช้
PUT    /api/admin/users/:id/reset-password - รีเซ็ตรหัสผ่าน
GET    /api/admin/stats           - ดึงสถิติระบบ
```

## หมายเหตุสำคัญ

- **เปลี่ยนรหัสผ่านเริ่มต้น**: หลังจากสร้าง admin user แล้ว ให้เปลี่ยนรหัสผ่านทันที
- **สร้าง Admin เพิ่ม**: ควรสร้าง admin user สำรองไว้
- **การสำรองข้อมูล**: ควรสำรองข้อมูลผู้ใช้เป็นประจำ
- **การอัปเดต**: ตรวจสอบการอัปเดตระบบเป็นประจำ

---

หากมีปัญหาหรือข้อสงสัย กรุณาติดต่อทีมพัฒนา
