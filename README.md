FORMAT FILE .env
===================================================================
.# Server Configuration<br>
PORT=8000<br>
NODE_ENV=public<br>

.# CORS Configuration<br>
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001<br>

.# Rate Limiting<br>
RATE_LIMIT_WINDOW_MS=300000<br>
RATE_LIMIT_MAX_REQUESTS=500<br>

.# Firebase Admin SDK Configuration<br>
.# ⚠️ กรุณาแทนที่ค่าเหล่านี้ด้วยข้อมูลจริงจาก Firebase Console<br>
FIREBASE_PROJECT_ID=example<br>
FIREBASE_PRIVATE_KEY_ID=1111111111111111111111111111<br>
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\example\n-----END PRIVATE KEY-----\n"<br>
FIREBASE_CLIENT_EMAIL=example<br>
FIREBASE_CLIENT_ID=1111111111111111111111111111<br>
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth<br>
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token<br>
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs<br>
FIREBASE_CLIENT_X509_CERT_URL=https://www.example.com<br>

=============================================================================
