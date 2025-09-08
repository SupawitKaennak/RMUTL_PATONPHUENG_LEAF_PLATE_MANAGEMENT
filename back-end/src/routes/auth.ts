import express from "express"
import { db } from "../config/firebase"
import bcrypt from "bcryptjs"
import { validateRegistration, validateLogin } from "../middleware/validation"
import { generateToken, verifyToken } from "../middleware/auth"
import { env } from "../config/env"
import type { ApiResponse } from "../types"

const router = express.Router()

// POST /api/auth/register - ลงทะเบียนผู้ใช้ใหม่
router.post("/register", validateRegistration, async (req, res): Promise<void> => {
  try {
    const { username, email, password, fullName } = req.body

    // ตรวจสอบว่ามี username หรือ email นี้อยู่แล้วหรือไม่
    const existingUserSnapshot = await db.collection("users")
      .where("username", "==", username)
      .get()

    if (!existingUserSnapshot.empty) {
      return res.status(400).json({
        success: false,
        error: "Username already exists"
      })
    }

    const existingEmailSnapshot = await db.collection("users")
      .where("email", "==", email)
      .get()

    if (!existingEmailSnapshot.empty) {
      return res.status(400).json({
        success: false,
        error: "Email already exists"
      })
    }

    // เข้ารหัส password
    const saltRounds = env.BCRYPT_SALT_ROUNDS
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // สร้างผู้ใช้ใหม่
    const userData = {
      username,
      email,
      password: hashedPassword,
      fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const docRef = await db.collection("users").add(userData)

    // สร้าง JWT token
    const token = generateToken({
      userId: docRef.id,
      username,
      email,
      fullName
    })

    const response: ApiResponse<{ token: string; user: any }> = {
      success: true,
      data: {
        token,
        user: {
          id: docRef.id,
          username,
          email,
          fullName
        }
      },
      message: "User registered successfully"
    }

    res.status(201).json(response)
  } catch (error) {
    console.error("Error registering user:", error)
    res.status(500).json({
      success: false,
      error: "Failed to register user"
    })
  }
})

// POST /api/auth/login - เข้าสู่ระบบ
router.post("/login", validateLogin, async (req, res): Promise<void> => {
  try {
    const { username, password } = req.body

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
        return res.status(401).json({
          success: false,
          error: "Invalid username/email or password"
        })
      }
      
      userDoc = emailSnapshot.docs[0]
    }

    const userData = userDoc.data()

    // ตรวจสอบ password
    const isPasswordValid = await bcrypt.compare(password, userData.password)
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid username/email or password"
      })
    }

    // สร้าง JWT token
    const token = generateToken({
      userId: userDoc.id,
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName
    })

    // อัปเดต lastLogin
    await userDoc.ref.update({
      lastLogin: new Date().toISOString()
    })

    const response: ApiResponse<{ token: string; user: any }> = {
      success: true,
      data: {
        token,
        user: {
          id: userDoc.id,
          username: userData.username,
          email: userData.email,
          fullName: userData.fullName
        }
      },
      message: "Login successful"
    }

    res.json(response)
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
    // ในระบบ JWT ไม่จำเป็นต้องทำอะไรเพิ่มเติม
    // Client จะต้องลบ token ออกจาก localStorage
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
router.get("/me", async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No token provided"
      })
    }

    const token = authHeader.substring(7)
    
    try {
      const decoded = verifyToken(token)
      
      // ค้นหาข้อมูลผู้ใช้จาก database
      const userDoc = await db.collection("users").doc(decoded.userId).get()
      
      if (!userDoc.exists) {
        return res.status(401).json({
          success: false,
          error: "User not found"
        })
      }

      const userData = userDoc.data()

      res.json({
        success: true,
        data: {
          id: userDoc.id,
          username: userData?.username,
          email: userData?.email,
          fullName: userData?.fullName
        }
      })
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token"
      })
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
