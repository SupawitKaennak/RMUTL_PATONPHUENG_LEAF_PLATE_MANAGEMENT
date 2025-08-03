# =============================================================================
# FRONT-END ENVIRONMENT VARIABLES (.env.local)
# =============================================================================
# ⚠️ ไฟล์นี้จะไม่ถูก commit ไปยัง Git repository
# ⚠️ กรุณาแทนที่ค่าเหล่านี้ด้วยข้อมูลจริงจาก Firebase Console

# =============================================================================
# FIREBASE CLIENT CONFIGURATION
# =============================================================================
# ค่าเหล่านี้ได้จาก Firebase Console > Project Settings > General > Your apps > Web app
# NEXT_PUBLIC_FIREBASE_API_KEY=example
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=example.firebaseapp.com
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=example
# NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=example.firebasestorage.app
# NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=0000000000000
# NEXT_PUBLIC_FIREBASE_APP_ID=00000000000000000000


# =============================================================================
# NEXT.js CONFIGURATION
# =============================================================================
# Port สำหรับ development server
PORT=3000

# Environment
NODE_ENV=development

# =============================================================================
# API CONFIGURATION
# =============================================================================
# URL ของ back-end API
NEXT_PUBLIC_API_URL=http://localhost:8000

# =============================================================================
# AUTHENTICATION
# =============================================================================
# Secret key สำหรับ JWT (ถ้าใช้)
# NEXTAUTH_SECRET=your_nextauth_secret_here
# NEXTAUTH_URL=http://localhost:3000

# =============================================================================
# DEVELOPMENT SETTINGS
# =============================================================================
# เปิดใช้งาน debug mode
DEBUG=true