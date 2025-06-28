FORMAT FILE .env
===================================================================
# Server Configuration
PORT=8000
NODE_ENV=public

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=300000
RATE_LIMIT_MAX_REQUESTS=500

# Firebase Admin SDK Configuration
# ⚠️ กรุณาแทนที่ค่าเหล่านี้ด้วยข้อมูลจริงจาก Firebase Console
FIREBASE_PROJECT_ID=example
FIREBASE_PRIVATE_KEY_ID=1111111111111111111111111111
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\example\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=example
FIREBASE_CLIENT_ID=1111111111111111111111111111
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.example.com

=============================================================================
