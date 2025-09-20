const admin = require('firebase-admin')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '../.env' })

// Initialize Firebase Admin using environment variables
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    authUri: process.env.FIREBASE_AUTH_URI,
    tokenUri: process.env.FIREBASE_TOKEN_URI,
  })
})

const db = admin.firestore()

async function createAdminUser() {
  try {
    const username = process.argv[2] || 'admin'
    const email = process.argv[3] || 'admin@example.com'
    const password = process.argv[4] || 'admin123'
    const fullName = process.argv[5] || 'System Administrator'

    console.log('🔧 Creating admin user...')
    console.log(`Username: ${username}`)
    console.log(`Email: ${email}`)
    console.log(`Full Name: ${fullName}`)

    // Check if user already exists
    const existingUserSnapshot = await db.collection('users')
      .where('username', '==', username)
      .get()

    if (!existingUserSnapshot.empty) {
      console.log('❌ User with this username already exists')
      return
    }

    const existingEmailSnapshot = await db.collection('users')
      .where('email', '==', email)
      .get()

    if (!existingEmailSnapshot.empty) {
      console.log('❌ User with this email already exists')
      return
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create admin user
    const userData = {
      username,
      email,
      password: hashedPassword,
      fullName,
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const docRef = await db.collection('users').add(userData)

    console.log('✅ Admin user created successfully!')
    console.log(`User ID: ${docRef.id}`)
    console.log('')
    console.log('You can now login with:')
    console.log(`Username: ${username}`)
    console.log(`Password: ${password}`)
    console.log('')
    console.log('⚠️  Remember to change the password after first login!')

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    process.exit(0)
  }
}

// Usage instructions
if (process.argv.length < 3) {
  console.log('Usage: node create-admin.js <username> <email> <password> <fullName>')
  console.log('Example: node create-admin.js admin admin@example.com admin123 "System Administrator"')
  console.log('')
  console.log('Default values will be used if not provided:')
  console.log('- Username: admin')
  console.log('- Email: admin@example.com')
  console.log('- Password: admin123')
  console.log('- Full Name: System Administrator')
  process.exit(1)
}

createAdminUser()
