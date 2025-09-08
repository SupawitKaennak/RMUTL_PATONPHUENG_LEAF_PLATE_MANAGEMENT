const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

/**
 * Generate a secure random JWT secret
 */
function generateJWTSecret() {
  // Generate a secure random JWT secret (64 bytes = 128 hex characters)
  const jwtSecret = crypto.randomBytes(64).toString('hex')
  
  console.log('🔐 Generated JWT Secret:')
  console.log(jwtSecret)
  console.log('\n📝 Add this to your .env file:')
  console.log(`JWT_SECRET=${jwtSecret}`)
  
  return jwtSecret
}

/**
 * Generate environment file template
 */
function generateEnvTemplate() {
  const jwtSecret = generateJWTSecret()
  
  const envTemplate = `# ===========================================
# JWT Configuration
# ===========================================
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d

# ===========================================
# Server Configuration
# ===========================================
PORT=8000
NODE_ENV=development

# ===========================================
# Firebase Configuration
# ===========================================
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour Private Key Here\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# ===========================================
# CORS Configuration
# ===========================================
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# ===========================================
# Security Configuration
# ===========================================
BCRYPT_SALT_ROUNDS=10
SESSION_DURATION=1800000

# ===========================================
# Rate Limiting Configuration
# ===========================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ===========================================
# Database Configuration
# ===========================================
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/

# ===========================================
# Logging Configuration
# ===========================================
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true`

  const envPath = path.join(__dirname, '.env')
  
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('\n⚠️  .env file already exists!')
    console.log('📝 Please manually update JWT_SECRET in your existing .env file')
    return
  }
  
  // Write .env file
  fs.writeFileSync(envPath, envTemplate)
  console.log('\n✅ Created .env file with generated JWT secret')
  console.log('🔒 Please update Firebase configuration in .env file')
}

// Run the script
if (require.main === module) {
  const command = process.argv[2]
  
  switch (command) {
    case 'secret':
      generateJWTSecret()
      break
    case 'env':
      generateEnvTemplate()
      break
    default:
      console.log('🔐 JWT Secret Generator')
      console.log('\nUsage:')
      console.log('  node generate-jwt-secret.js secret  - Generate JWT secret only')
      console.log('  node generate-jwt-secret.js env     - Generate complete .env file')
      console.log('\nExamples:')
      console.log('  npm run generate-jwt-secret')
      console.log('  npm run generate-env')
  }
}

module.exports = {
  generateJWTSecret,
  generateEnvTemplate
}
