# Rate Limiting Configuration Guide

## ปัญหาที่แก้ไข

### ปัญหาเดิม:
- Rate Limiting เข้มงวดเกินไป (1000 requests per 15 minutes)
- ทำให้เกิดข้อผิดพลาด "Too Many Requests" บ่อยๆ
- ไม่เหมาะสำหรับการพัฒนาและทดสอบ

### การแก้ไข:
- แยก Rate Limiting สำหรับ Development และ Production
- Development: 200 requests per 30 seconds (หรือ 1000 per 10 seconds)
- Production: 100 requests per 1 minute
- Auth endpoints: 20-50 requests per 15 minutes

## การตั้งค่า Rate Limiting

### 1. Environment Variables

ในไฟล์ `.env`:

```bash
# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=30000      # 30 seconds
RATE_LIMIT_MAX_REQUESTS=200     # 200 requests per window
```

### 2. Development vs Production

**Development Mode (NODE_ENV=development):**
- Window: 30 seconds
- Max Requests: 200
- Skip successful requests: Yes
- Very lenient for API calls

**Production Mode (NODE_ENV=production):**
- Window: 1 minute
- Max Requests: 100
- Skip successful requests: No
- Standard protection

### 3. Auth Endpoints

Authentication endpoints มี Rate Limiting แยกต่างหาก:
- Development: 50 requests per 15 minutes
- Production: 20 requests per 15 minutes

## การใช้งาน

### 1. รันเซิร์ฟเวอร์

```bash
npm run dev
```

คุณจะเห็น:
```
🚀 Server running on port 8000
🌍 Environment: development
⚡ Rate Limiting: Development Mode (Very Lenient)
📊 Dev Rate Limit: 1000 requests per 10 seconds
```

### 2. ตรวจสอบ Rate Limit Headers

API responses จะมี headers:
```
RateLimit-Limit: 200
RateLimit-Remaining: 195
RateLimit-Reset: 1640995200
```

### 3. การจัดการ Rate Limit Exceeded

หากเกิน Rate Limit จะได้รับ response:
```json
{
  "error": "Too many requests from this IP, please try again later.",
  "retryAfter": "Please wait a few minutes before trying again.",
  "limit": "Rate limit exceeded"
}
```

## การปรับแต่ง Rate Limiting

### 1. เพิ่มจำนวน Requests

แก้ไขใน `.env`:
```bash
RATE_LIMIT_MAX_REQUESTS=500  # เพิ่มเป็น 500 requests
```

### 2. ลด Window Time

แก้ไขใน `.env`:
```bash
RATE_LIMIT_WINDOW_MS=10000   # ลดเป็น 10 seconds
```

### 3. ปิด Rate Limiting ใน Development

แก้ไขใน `server.ts`:
```typescript
if (isDevelopment) {
  // ไม่ใช้ rate limiting ใน development
  // app.use("/api/materials", devLimiter)
} else {
  app.use("/api/materials", generalLimiter)
}
```

## Troubleshooting

### 1. ยังได้รับ "Too Many Requests"

ตรวจสอบ:
- Environment variable `NODE_ENV=development`
- ไฟล์ `.env` มีค่า `RATE_LIMIT_MAX_REQUESTS=200`
- รีสตาร์ทเซิร์ฟเวอร์

### 2. Rate Limiting ไม่ทำงาน

ตรวจสอบ:
- Console log แสดง "Development Mode (Very Lenient)"
- ไม่มี error ใน server startup

### 3. Production Rate Limiting

สำหรับ production:
```bash
NODE_ENV=production
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## Best Practices

### 1. Development
- ใช้ Rate Limiting ที่ยืดหยุ่น
- Skip successful requests
- Window time สั้น

### 2. Production
- ใช้ Rate Limiting ที่เข้มงวด
- ไม่ skip successful requests
- Window time ยาวขึ้น

### 3. Monitoring
- ตรวจสอบ Rate Limit headers
- Log rate limit violations
- Monitor API usage patterns

## การทดสอบ Rate Limiting

### 1. ทดสอบด้วย curl

```bash
# ทดสอบ API calls หลายครั้ง
for i in {1..10}; do
  curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/materials
done
```

### 2. ทดสอบด้วย Postman

สร้าง Collection ที่เรียก API หลายครั้งติดต่อกัน

### 3. ทดสอบด้วย Browser

เปิด Developer Tools และเรียก API หลายครั้งใน Console
