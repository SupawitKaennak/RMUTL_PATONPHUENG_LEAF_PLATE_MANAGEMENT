import express from "express"
import { db } from "../config/firebase"
import bcrypt from "bcryptjs"
import { validateRegistration, validateLogin } from "../middleware/validation"
import { generateToken, verifyToken } from "../middleware/auth"
import { env } from "../config/env"
import type { ApiResponse } from "../types"
import { setCsrfCookie, getCsrfCookieName } from "../middleware/csrf"
import { logSecurityEvent } from "../middleware/logger"
import { getClientIp } from "../utils/ip"

// In-memory login attempt tracking (replace with Redis in production)
const loginAttempts: Record<string, { count: number; until?: number }> = {}
const MAX_ATTEMPTS = 5
const LOCK_MS = 15 * 60 * 1000 // 15 minutes

const router = express.Router()

// GET /api/auth/csrf - issue CSRF cookie for the client (idempotent)
router.get("/csrf", (req, res) => {
  const name = getCsrfCookieName()
  const token = setCsrfCookie(res)
  res.json({ success: true, data: { cookie: name } })
})

// POST /api/auth/register - ลงทะเบียนผู้ใช้ใหม่
router.post("/register", validateRegistration, async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body

    // ตรวจสอบว่ามี username หรือ email นี้อยู่แล้วหรือไม่
    const existingUserSnapshot = await db.collection("users")
      .where("username", "==", username)
      .get()

    if (!existingUserSnapshot.empty) {
      res.status(400).json({
        success: false,
        error: "Username already exists"
      })
      return
    }

    const existingEmailSnapshot = await db.collection("users")
      .where("email", "==", email)
      .get()

    if (!existingEmailSnapshot.empty) {
      res.status(400).json({
        success: false,
        error: "Email already exists"
      })
      return
    }

    // เข้ารหัส password
    const saltRounds = env.BCRYPT_SALT_ROUNDS
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // สร้างผู้ใช้ใหม่ (default role เป็น 'user')
    const userData = {
      username,
      email,
      password: hashedPassword,
      fullName,
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const docRef = await db.collection("users").add(userData)

    // สร้าง JWT token
    const token = generateToken({
      userId: docRef.id,
      username,
      email,
      fullName,
      role: 'user'
    })

    // Set HttpOnly cookie with token
    const isProduction = process.env.NODE_ENV === 'production'
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: isProduction, // Only secure in production (HTTPS)
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000, // 30 minutes
      path: '/'
    })

    // Set token expiry cookie
    const expiryTime = Date.now() + (30 * 60 * 1000) // 30 minutes
    res.cookie('tokenExpiry', expiryTime.toString(), {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000, // 30 minutes
      path: '/'
    })

    // Issue CSRF cookie for frontend to read
    const csrfToken = setCsrfCookie(res)

    const response: ApiResponse<{ user: any }> = {
      success: true,
      data: {
        user: {
          id: docRef.id,
          username,
          email,
          fullName,
          role: 'user'
        }
      },
      message: "User registered successfully"
    }

    res.status(201).json({ ...response, csrfCookie: getCsrfCookieName() })
  } catch (error) {
    console.error("Error registering user:", error)
    res.status(500).json({
      success: false,
      error: "Failed to register user"
    })
  }
})

// POST /api/auth/login - เข้าสู่ระบบ
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body

    const ip = getClientIp(req)
    const key = `${ip}:${username}`
    const entry = loginAttempts[key]
    if (entry && entry.until && entry.until > Date.now()) {
      logSecurityEvent("auth.login.locked", { ip, username })
      res.status(429).json({ success: false, error: "Too many attempts. Try again later." })
      return
    }

    // ค้นหาผู้ใช้จาก username หรือ email
    const userSnapshot = await db.collection("users")
      .where("username", "==", username)
      .get()

    let userDoc = userSnapshot.docs[0]

    // ถ้าไม่เจอจาก username ให้ลองค้นหาจาก email
    if (userSnapshot.empty) {
      const emailSnapshot = await db.collection("users")
        .where("email", "==", username)
        .get()
      
      if (emailSnapshot.empty) {
        loginAttempts[key] = { count: (entry?.count || 0) + 1 }
        if (loginAttempts[key].count >= MAX_ATTEMPTS) {
          loginAttempts[key].until = Date.now() + LOCK_MS
        }
        logSecurityEvent("auth.login.failure", { ip, username })
        res.status(401).json({ success: false, error: "Invalid credentials" })
        return
      }
      
      userDoc = emailSnapshot.docs[0]
    }

    const userData = userDoc.data()

    // ตรวจสอบ password
    const isPasswordValid = await bcrypt.compare(password, userData.password)
    
    if (!isPasswordValid) {
      loginAttempts[key] = { count: (entry?.count || 0) + 1 }
      if (loginAttempts[key].count >= MAX_ATTEMPTS) {
        loginAttempts[key].until = Date.now() + LOCK_MS
      }
      logSecurityEvent("auth.login.failure", { ip, username: userData.username })
      res.status(401).json({ success: false, error: "Invalid credentials" })
      return
    }

    // สร้าง JWT token
    const token = generateToken({
      userId: userDoc.id,
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role || 'user'
    })

    // อัปเดต lastLogin
    await userDoc.ref.update({
      lastLogin: new Date().toISOString()
    })

    // Set HttpOnly cookie with token
    const isProduction = process.env.NODE_ENV === 'production'
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: isProduction, // Only secure in production (HTTPS)
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000, // 30 minutes
      path: '/'
    })

    // Set token expiry cookie
    const expiryTime = Date.now() + (30 * 60 * 1000) // 30 minutes
    res.cookie('tokenExpiry', expiryTime.toString(), {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000, // 30 minutes
      path: '/'
    })

    // Issue CSRF cookie for frontend to read
    const csrfToken = setCsrfCookie(res)

    const response: ApiResponse<{ user: any; clientIp?: string }> = {
      success: true,
      data: {
        user: {
          id: userDoc.id,
          username: userData.username,
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role || 'user'
        },
        clientIp: ip,
      },
      message: "Login successful"
    }
    // reset attempts on success
    delete loginAttempts[key]
    logSecurityEvent("auth.login.success", { ip, userId: userDoc.id })
    res.json({ ...response, csrfCookie: getCsrfCookieName() })
  } catch (error) {
    console.error("Error logging in:", error)
    res.status(500).json({
      success: false,
      error: "Failed to login"
    })
  }
})

// POST /api/auth/logout - ออกจากระบบ
router.post("/logout", async (req, res) => {
  try {
    // Clear HttpOnly cookies
    res.clearCookie('authToken', { path: '/' })
    res.clearCookie('tokenExpiry', { path: '/' })
    
    res.json({
      success: true,
      message: "Logout successful"
    })
  } catch (error) {
    console.error("Error logging out:", error)
    res.status(500).json({
      success: false,
      error: "Failed to logout"
    })
  }
})

// GET /api/auth/me - ตรวจสอบสถานะการเข้าสู่ระบบ
router.get("/me", async (req, res) => {
  try {
    // Try to get token from cookies first, then fallback to Authorization header
    let token = req.cookies?.authToken
    
    if (!token) {
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7)
      }
    }
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: "No token provided"
      })
      return
    }
    
    try {
      const decoded = verifyToken(token)
      
      // ค้นหาข้อมูลผู้ใช้จาก database
      const userDoc = await db.collection("users").doc(decoded.userId).get()
      
      if (!userDoc.exists) {
        res.status(401).json({
          success: false,
          error: "User not found"
        })
        return
      }

      const userData = userDoc.data()

      res.json({
        success: true,
        data: {
          id: userDoc.id,
          username: userData?.username,
          email: userData?.email,
          fullName: userData?.fullName,
          role: userData?.role || 'user'
        }
      })
    } catch (jwtError) {
      res.status(401).json({
        success: false,
        error: "Invalid or expired token"
      })
      return
    }
  } catch (error) {
    console.error("Error checking auth status:", error)
    res.status(500).json({
      success: false,
      error: "Failed to check auth status"
    })
  }
})

export default router
