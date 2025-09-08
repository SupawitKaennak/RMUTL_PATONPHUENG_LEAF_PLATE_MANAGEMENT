import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// ตรวจสอบและโหลด environment variables
const envPath = path.resolve(process.cwd(), ".env")
const envLocalPath = path.resolve(process.cwd(), ".env.local")

// ลองโหลด .env.local ก่อน ถ้าไม่มีให้ใช้ .env
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath })
  console.log("📁 Using .env.local configuration")
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
  console.log("📁 Using .env configuration")
} else {
  console.warn("⚠️  No .env or .env.local file found. Using system environment variables.")
  dotenv.config()
}

// Environment validation
const requiredEnvVars = [
  'JWT_SECRET',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL'
]

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:')
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`)
  })
  console.error('\n📝 Please create a .env file with the required variables.')
  console.error('💡 You can copy .env.example and fill in the values.')
  process.exit(1)
}

// JWT Secret validation
if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-here-change-this-in-production') {
  console.warn('⚠️  WARNING: You are using the default JWT secret!')
  console.warn('🔒 Please change JWT_SECRET in your .env file for security.')
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters long for security.')
}

export const env = {
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Server Configuration
  PORT: parseInt(process.env.PORT || '8000'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Firebase Configuration
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID!,
  FIREBASE_PRIVATE_KEY_ID: process.env.FIREBASE_PRIVATE_KEY_ID!,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL!,
  FIREBASE_CLIENT_ID: process.env.FIREBASE_CLIENT_ID!,
  FIREBASE_AUTH_URI: process.env.FIREBASE_AUTH_URI!,
  FIREBASE_TOKEN_URI: process.env.FIREBASE_TOKEN_URI!,
  
  // CORS Configuration
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://127.0.0.1:3000'],
  
  // Security Configuration
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
  SESSION_DURATION: parseInt(process.env.SESSION_DURATION || '1800000'), // 30 minutes in milliseconds
  
  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '30000'), // 30 seconds default
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200'), // 200 requests default
  
  // Logging Configuration
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ENABLE_REQUEST_LOGGING: process.env.ENABLE_REQUEST_LOGGING === 'true',
}
