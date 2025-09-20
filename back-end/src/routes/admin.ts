import express from "express"
import { db } from "../config/firebase"
import bcrypt from "bcryptjs"
import { authenticateToken, requireAdmin } from "../middleware/auth"
import { env } from "../config/env"
import type { ApiResponse } from "../types"
import { logSecurityEvent } from "../middleware/logger"
import { getClientIp } from "../utils/ip"

const router = express.Router()

// ใช้ middleware ตรวจสอบ admin role สำหรับทุก routes
router.use(authenticateToken)
router.use(requireAdmin)

// GET /api/admin/users - ดึงรายชื่อผู้ใช้ทั้งหมด
router.get("/users", async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get()
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        role: data.role || 'user',
        isActive: data.isActive !== false,
        createdAt: data.createdAt,
        lastLogin: data.lastLogin
      }
    })

    res.json({
      success: true,
      data: users,
      message: "Users retrieved successfully"
    } as ApiResponse)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch users"
    })
  }
})

// GET /api/admin/users/:id - ดึงข้อมูลผู้ใช้เฉพาะ
router.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params
    const userDoc = await db.collection("users").doc(id).get()
    
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        error: "User not found"
      })
      return
    }

    const userData = userDoc.data()
    const user = {
      id: userDoc.id,
      username: userData?.username,
      email: userData?.email,
      fullName: userData?.fullName,
      role: userData?.role || 'user',
      isActive: userData?.isActive !== false,
      createdAt: userData?.createdAt,
      lastLogin: userData?.lastLogin
    }

    res.json({
      success: true,
      data: user,
      message: "User retrieved successfully"
    } as ApiResponse)
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch user"
    })
  }
})

// POST /api/admin/users - สร้างผู้ใช้ใหม่
router.post("/users", async (req, res) => {
  try {
    const { username, email, password, fullName, role = 'user' } = req.body

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !email || !password || !fullName) {
      res.status(400).json({
        success: false,
        error: "Missing required fields"
      })
      return
    }

    // ตรวจสอบว่า role ถูกต้อง
    if (!['admin', 'user'].includes(role)) {
      res.status(400).json({
        success: false,
        error: "Invalid role"
      })
      return
    }

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

    // สร้างผู้ใช้ใหม่
    const userData = {
      username,
      email,
      password: hashedPassword,
      fullName,
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const docRef = await db.collection("users").add(userData)

    // บันทึก audit log
    logSecurityEvent("admin.user.created", {
      adminUserId: req.user?.userId,
      adminUsername: req.user?.username,
      newUserId: docRef.id,
      newUsername: username,
      ip: getClientIp(req)
    })

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        username,
        email,
        fullName,
        role,
        isActive: true
      },
      message: "User created successfully"
    } as ApiResponse)
  } catch (error) {
    console.error("Error creating user:", error)
    res.status(500).json({
      success: false,
      error: "Failed to create user"
    })
  }
})

// PUT /api/admin/users/:id - อัปเดตข้อมูลผู้ใช้
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { username, email, fullName, role, isActive } = req.body

    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
    const userDoc = await db.collection("users").doc(id).get()
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        error: "User not found"
      })
      return
    }

    // ตรวจสอบว่า role ถูกต้อง (ถ้ามี)
    if (role && !['admin', 'user'].includes(role)) {
      res.status(400).json({
        success: false,
        error: "Invalid role"
      })
      return
    }

    // ตรวจสอบ username และ email ซ้ำ (ถ้ามีการเปลี่ยนแปลง)
    const currentData = userDoc.data()
    
    if (username && username !== currentData?.username) {
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
    }

    if (email && email !== currentData?.email) {
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
    }

    // เตรียมข้อมูลสำหรับอัปเดต
    const updateData: any = {
      updatedAt: new Date().toISOString()
    }

    if (username) updateData.username = username
    if (email) updateData.email = email
    if (fullName) updateData.fullName = fullName
    if (role) updateData.role = role
    if (typeof isActive === 'boolean') updateData.isActive = isActive

    await userDoc.ref.update(updateData)

    // บันทึก audit log
    logSecurityEvent("admin.user.updated", {
      adminUserId: req.user?.userId,
      adminUsername: req.user?.username,
      targetUserId: id,
      targetUsername: username || currentData?.username,
      changes: updateData,
      ip: getClientIp(req)
    })

    res.json({
      success: true,
      data: {
        id,
        ...updateData
      },
      message: "User updated successfully"
    } as ApiResponse)
  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update user"
    })
  }
})

// DELETE /api/admin/users/:id - ลบผู้ใช้
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params

    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
    const userDoc = await db.collection("users").doc(id).get()
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        error: "User not found"
      })
      return
    }

    const userData = userDoc.data()

    // ป้องกันการลบตัวเอง
    if (id === req.user?.userId) {
      res.status(400).json({
        success: false,
        error: "Cannot delete your own account"
      })
      return
    }

    await userDoc.ref.delete()

    // บันทึก audit log
    logSecurityEvent("admin.user.deleted", {
      adminUserId: req.user?.userId,
      adminUsername: req.user?.username,
      deletedUserId: id,
      deletedUsername: userData?.username,
      ip: getClientIp(req)
    })

    res.json({
      success: true,
      message: "User deleted successfully"
    } as ApiResponse)
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete user"
    })
  }
})

// PUT /api/admin/users/:id/reset-password - รีเซ็ตรหัสผ่าน
router.put("/users/:id/reset-password", async (req, res) => {
  try {
    const { id } = req.params
    const { newPassword } = req.body

    if (!newPassword) {
      res.status(400).json({
        success: false,
        error: "New password is required"
      })
      return
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
    const userDoc = await db.collection("users").doc(id).get()
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        error: "User not found"
      })
      return
    }

    const userData = userDoc.data()

    // เข้ารหัสรหัสผ่านใหม่
    const saltRounds = env.BCRYPT_SALT_ROUNDS
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    await userDoc.ref.update({
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    })

    // บันทึก audit log
    logSecurityEvent("admin.user.password_reset", {
      adminUserId: req.user?.userId,
      adminUsername: req.user?.username,
      targetUserId: id,
      targetUsername: userData?.username,
      ip: getClientIp(req)
    })

    res.json({
      success: true,
      message: "Password reset successfully"
    } as ApiResponse)
  } catch (error) {
    console.error("Error resetting password:", error)
    res.status(500).json({
      success: false,
      error: "Failed to reset password"
    })
  }
})

// GET /api/admin/stats - สถิติระบบสำหรับ admin
router.get("/stats", async (req, res) => {
  try {
    // ดึงสถิติผู้ใช้
    const usersSnapshot = await db.collection("users").get()
    const totalUsers = usersSnapshot.size
    const activeUsers = usersSnapshot.docs.filter(doc => doc.data().isActive !== false).length
    const adminUsers = usersSnapshot.docs.filter(doc => doc.data().role === 'admin').length

    // ดึงสถิติอื่นๆ (ถ้าต้องการ)
    const materialsSnapshot = await db.collection("materials").get()
    const ordersSnapshot = await db.collection("orders").get()
    const transactionsSnapshot = await db.collection("transactions").get()

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers,
        regular: totalUsers - adminUsers
      },
      data: {
        materials: materialsSnapshot.size,
        orders: ordersSnapshot.size,
        transactions: transactionsSnapshot.size
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    }

    res.json({
      success: true,
      data: stats,
      message: "System stats retrieved successfully"
    } as ApiResponse)
  } catch (error) {
    console.error("Error fetching system stats:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch system stats"
    })
  }
})

export default router
