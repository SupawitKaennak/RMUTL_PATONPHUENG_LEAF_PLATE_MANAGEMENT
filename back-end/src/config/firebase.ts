import admin from "firebase-admin"

// ตรวจสอบว่ามี Firebase credentials หรือไม่
const hasFirebaseCredentials = !!(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_CLIENT_EMAIL
)

if (!hasFirebaseCredentials) {
  console.error("❌ Missing Firebase credentials")
  console.error("💡 Required environment variables:")
  console.error("   - FIREBASE_PROJECT_ID")
  console.error("   - FIREBASE_PRIVATE_KEY")
  console.error("   - FIREBASE_CLIENT_EMAIL")
  process.exit(1)
}

// ใช้ Firebase credentials จริง
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
  token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url:
    process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
}

console.log("🔧 Firebase Config Status:")
console.log("- Environment:", process.env.NODE_ENV || "development")
console.log("- Project ID:", serviceAccount.project_id)
console.log("- Client Email:", serviceAccount.client_email)
console.log("- Using Real Credentials: ✅")

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: serviceAccount.project_id,
    })
    console.log("🔥 Firebase Admin initialized successfully!")
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error)
    process.exit(1)
  }
}

// Export Firestore instance
export const db = admin.firestore()

export default admin
