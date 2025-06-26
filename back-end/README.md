# Income Expense Tracker - Backend API

Backend API สำหรับระบบจัดการรายรับ-รายจ่าย พร้อมการจัดการวัตถุดิบและออเดอร์

## 🚀 Features

- **RESTful API** สำหรับจัดการข้อมูล
- **Firebase Firestore** สำหรับฐานข้อมูล
- **Input Validation** ด้วย Joi
- **Rate Limiting** ป้องกัน DDoS
- **CORS Support** สำหรับ Frontend
- **Error Handling** แบบ Centralized
- **TypeScript** สำหรับ Type Safety

## 📋 API Endpoints

### Materials
- `GET /api/materials` - ดึงข้อมูลวัตถุดิบทั้งหมด
- `POST /api/materials` - เพิ่มวัตถุดิบใหม่
- `PUT /api/materials/:id` - อัปเดตวัตถุดิบ
- `DELETE /api/materials/:id` - ลบวัตถุดิบ
- `POST /api/materials/quantity` - เพิ่ม/ลดจำนวนวัตถุดิบ

### Material History
- `GET /api/material-history` - ดึงประวัติวัตถุดิบ
- `POST /api/material-history` - เพิ่มประวัติวัตถุดิบ

### Orders
- `GET /api/orders` - ดึงข้อมูลออเดอร์ทั้งหมด
- `POST /api/orders` - เพิ่มออเดอร์ใหม่
- `PUT /api/orders/:id` - อัปเดตออเดอร์
- `DELETE /api/orders/:id` - ลบออเดอร์
- `POST /api/orders/production` - เพิ่มจำนวนการผลิต

### Transactions
- `GET /api/transactions` - ดึงข้อมูลรายรับ-รายจ่าย
- `POST /api/transactions` - เพิ่มรายรับ-รายจ่าย
- `PUT /api/transactions/:id` - อัปเดตรายรับ-รายจ่าย
- `DELETE /api/transactions/:id` - ลบรายรับ-รายจ่าย

## 🛠️ Installation

\`\`\`bash
# Clone repository
git clone <repository-url>
cd backend-api

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# แก้ไขค่าใน .env ตามการตั้งค่า Firebase

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

## 🔧 Environment Variables

\`\`\`env
# Server Configuration
PORT=8000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your_client_cert_url
\`\`\`

## 📁 Project Structure

\`\`\`
src/
├── config/
│   └── firebase.ts          # Firebase configuration
├── middleware/
│   ├── error-handler.ts     # Error handling middleware
│   ├── not-found.ts         # 404 handler
│   └── validation.ts        # Input validation
├── routes/
│   ├── materials.ts         # Materials endpoints
│   ├── material-history.ts  # Material history endpoints
│   ├── orders.ts           # Orders endpoints
│   └── transactions.ts     # Transactions endpoints
├── types/
│   └── index.ts            # TypeScript type definitions
└── server.ts               # Main server file
\`\`\`

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request rate limiting
- **Input Validation** - Request validation with Joi
- **Error Handling** - Centralized error handling

## 🚀 Deployment

### Using PM2
\`\`\`bash
npm install -g pm2
npm run build
pm2 start dist/server.js --name "income-expense-api"
\`\`\`

### Using Docker
\`\`\`bash
docker build -t income-expense-api .
docker run -p 8000:8000 income-expense-api
\`\`\`

## 📊 Health Check

\`\`\`bash
GET /health
\`\`\`

Response:
\`\`\`json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
\`\`\`

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
