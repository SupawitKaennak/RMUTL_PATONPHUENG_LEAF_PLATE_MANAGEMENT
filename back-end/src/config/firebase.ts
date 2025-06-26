import admin from "firebase-admin"

// ตรวจสอบว่าอยู่ใน development mode หรือไม่
const isDevelopment = process.env.NODE_ENV === "development"

// Mock Firebase configuration สำหรับ development
const mockServiceAccount = {
  type: "service_account",
  project_id: "demo-project",
  private_key_id: "mock-key-id",
  private_key: "-----BEGIN PRIVATE KEY-----\nMOCK_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  client_email: "mock@demo-project.iam.gserviceaccount.com",
  client_id: "123456789",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/mock%40demo-project.iam.gserviceaccount.com",
}

// ตรวจสอบว่ามี Firebase credentials หรือไม่
const hasFirebaseCredentials = !!(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_CLIENT_EMAIL
)

let serviceAccount: any

if (hasFirebaseCredentials) {
  // ใช้ Firebase credentials จริง
  serviceAccount = {
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
  console.log("🔥 Using real Firebase credentials")
} else if (isDevelopment) {
  // ใช้ mock credentials ใน development
  serviceAccount = mockServiceAccount
  console.log("🧪 Using mock Firebase credentials for development")
} else {
  // Production ต้องมี credentials จริง
  console.error("❌ Missing Firebase credentials in production environment")
  process.exit(1)
}

console.log("🔧 Firebase Config Status:")
console.log("- Environment:", process.env.NODE_ENV || "development")
console.log("- Project ID:", serviceAccount.project_id)
console.log("- Client Email:", serviceAccount.client_email)
console.log("- Using Real Credentials:", hasFirebaseCredentials ? "✅" : "❌")

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    if (hasFirebaseCredentials) {
      // Initialize with real Firebase
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        projectId: serviceAccount.project_id,
      })
      console.log("🔥 Firebase Admin initialized with real credentials!")
    } else if (isDevelopment) {
      // Initialize with Firestore emulator for development
      process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080"
      admin.initializeApp({
        projectId: "demo-project",
      })
      console.log("🧪 Firebase Admin initialized with emulator!")
      console.log("📝 Make sure to run: firebase emulators:start --only firestore")
    }
  } catch (error) {
    if (isDevelopment) {
      console.warn("⚠️  Firebase initialization failed, using mock database")
      // ใน development ถ้า Firebase ไม่ทำงาน ให้ใช้ mock
    } else {
      console.error("❌ Firebase initialization failed:", error)
      process.exit(1)
    }
  }
}

// Export Firestore instance
export const db = hasFirebaseCredentials || isDevelopment ? admin.firestore() : createMockFirestore()

// Mock Firestore สำหรับกรณีที่ไม่มี Firebase
function createMockFirestore() {
  const mockData: { [collection: string]: { [id: string]: any } } = {}

  return {
    collection: (name: string) => ({
      get: async () => ({
        docs: Object.entries(mockData[name] || {}).map(([id, data]) => ({
          id,
          data: () => data,
        })),
        empty: !mockData[name] || Object.keys(mockData[name]).length === 0,
      }),
      add: async (data: any) => {
        if (!mockData[name]) mockData[name] = {}
        const id = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        mockData[name][id] = data
        console.log(`📝 Mock: Added to ${name}:`, { id, ...data })
        return { id }
      },
      doc: (id: string) => ({
        get: async () => ({
          exists: !!(mockData[name] && mockData[name][id]),
          data: () => mockData[name]?.[id],
        }),
        update: async (data: any) => {
          if (!mockData[name]) mockData[name] = {}
          mockData[name][id] = { ...mockData[name][id], ...data }
          console.log(`📝 Mock: Updated ${name}/${id}:`, data)
        },
        delete: async () => {
          if (mockData[name] && mockData[name][id]) {
            delete mockData[name][id]
            console.log(`📝 Mock: Deleted ${name}/${id}`)
          }
        },
        ref: {
          update: async (data: any) => {
            if (!mockData[name]) mockData[name] = {}
            mockData[name][id] = { ...mockData[name][id], ...data }
            console.log(`📝 Mock: Updated ${name}/${id}:`, data)
          },
        },
      }),
      where: (field: string, operator: string, value: any) => ({
        get: async () => {
          const results = Object.entries(mockData[name] || {}).filter(([id, data]) => {
            if (operator === "==") return data[field] === value
            return false
          })
          return {
            docs: results.map(([id, data]) => ({
              id,
              data: () => data,
              ref: {
                update: async (updateData: any) => {
                  mockData[name][id] = { ...data, ...updateData }
                  console.log(`📝 Mock: Updated ${name}/${id}:`, updateData)
                },
              },
            })),
            empty: results.length === 0,
          }
        },
      }),
    }),
  } as any
}

export default admin
