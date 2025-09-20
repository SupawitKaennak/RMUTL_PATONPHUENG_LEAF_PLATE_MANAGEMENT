const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '../.env' })

// Import Firebase config from the existing setup
const { db } = require('../src/config/firebase')

async function createFirstAdmin() {
  try {
    const username = process.argv[2] || 'admin'
    const email = process.argv[3] || 'admin@example.com'
    const password = process.argv[4] || 'admin123'
    const fullName = process.argv[5] || 'System Administrator'

    console.log('🔧 Creating first admin user...')
    console.log(`Username: ${username}`)
    console.log(`Email: ${email}`)
    console.log(`Full Name: ${fullName}`)

    // Check if any admin already exists
    const existingAdminSnapshot = await db.collection('users')
      .where('role', '==', 'admin')
      .get()

    if (!existingAdminSnapshot.empty) {
      console.log('⚠️  Admin user already exists in the system')
      console.log('Existing admins:')
      existingAdminSnapshot.docs.forEach(doc => {
        const data = doc.data()
        console.log(`- ${data.username} (${data.email})`)
      })
      return
    }

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
    console.log('🔑 Login credentials:')
    console.log(`Username: ${username}`)
    console.log(`Password: ${password}`)
    console.log('')
    console.log('📋 Next steps:')
    console.log('1. Start your backend server: npm run dev')
    console.log('2. Start your frontend server: npm run dev')
    console.log('3. Go to http://localhost:3000/login')
    console.log('4. Login with the credentials above')
    console.log('5. You will see "Admin" menu in the sidebar')
    console.log('6. Click on "Admin Dashboard" to access admin panel')
    console.log('')
    console.log('⚠️  IMPORTANT: Change the password after first login!')

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    process.exit(0)
  }
}

// Usage instructions
if (process.argv.length < 3) {
  console.log('Usage: node create-first-admin.js <username> <email> <password> <fullName>')
  console.log('Example: node create-first-admin.js admin admin@example.com admin123 "System Administrator"')
  console.log('')
  console.log('Default values will be used if not provided:')
  console.log('- Username: admin')
  console.log('- Email: admin@example.com')
  console.log('- Password: admin123')
  console.log('- Full Name: System Administrator')
  process.exit(1)
}

createFirstAdmin()
