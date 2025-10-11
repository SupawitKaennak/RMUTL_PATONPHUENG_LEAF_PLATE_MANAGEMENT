import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        username: string
        email: string
        fullName: string
        role: 'admin' | 'user'
        iat?: number
        exp?: number
      }
    }
  }
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token from cookies and adds user info to request object
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      error: "ไม่พบ Token การเข้าสู่ระบบ" 
    })
    return
  }
  
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any
    
    // ตรวจสอบสถานะผู้ใช้จากฐานข้อมูล
    const { db } = await import('../config/firebase')
    const userDoc = await db.collection("users").doc(decoded.userId).get()
    
    if (!userDoc.exists) {
      res.status(401).json({ 
        success: false, 
        error: "ไม่พบผู้ใช้ในระบบ" 
      })
      return
    }
    
    const userData = userDoc.data()
    
    // ตรวจสอบสถานะบัญชีผู้ใช้
    if (userData?.isActive === false) {
      res.status(401).json({ 
        success: false, 
        error: "บัญชีถูกปิดใช้งาน" 
      })
      return
    }
    
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      fullName: decoded.fullName,
      role: decoded.role || 'user',
      iat: decoded.iat,
      exp: decoded.exp
    }
    next()
  } catch (error) {
    console.error('JWT verification error:', error)
    res.status(401).json({ 
      success: false, 
      error: "Token ไม่ถูกต้องหรือหมดอายุ" 
    })
    return
  }
}

/**
 * Optional JWT Authentication Middleware
 * Verifies JWT token if present, but doesn't require it
 */
export const optionalAuthenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Try to get token from cookies first, then fallback to Authorization header
  let token = req.cookies?.authToken
  
  if (!token) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    }
  }
  
  if (!token) {
    return next() // Continue without authentication
  }
  
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any
    
    // ตรวจสอบสถานะผู้ใช้จากฐานข้อมูล (เฉพาะเมื่อมี token)
    const { db } = await import('../config/firebase')
    const userDoc = await db.collection("users").doc(decoded.userId).get()
    
    if (userDoc.exists) {
      const userData = userDoc.data()
      
      // ตรวจสอบสถานะบัญชีผู้ใช้
      if (userData?.isActive !== false) {
        req.user = {
          userId: decoded.userId,
          username: decoded.username,
          email: decoded.email,
          fullName: decoded.fullName,
          role: decoded.role || 'user',
          iat: decoded.iat,
          exp: decoded.exp
        }
      }
    }
  } catch (error) {
    console.error('JWT verification error:', error)
    // Continue without authentication for optional middleware
  }
  
  next()
}

/**
 * Generate JWT Token
 */
export const generateToken = (payload: {
  userId: string
  username: string
  email: string
  fullName: string
  role?: 'admin' | 'user'
}): string => {
  return jwt.sign(payload, env.JWT_SECRET, { 
    expiresIn: env.JWT_EXPIRES_IN 
  } as jwt.SignOptions)
}

/**
 * Verify JWT Token
 */
export const verifyToken = (token: string): any => {
  return jwt.verify(token, env.JWT_SECRET)
}

/**
 * Decode JWT Token without verification (for debugging)
 */
export const decodeToken = (token: string): any => {
  return jwt.decode(token)
}

/**
 * Admin Role Middleware
 * Requires user to be authenticated and have admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      error: "ต้องเข้าสู่ระบบก่อน" 
    })
    return
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ 
      success: false, 
      error: "ต้องเป็นผู้ดูแลระบบเท่านั้น" 
    })
    return
  }

  next()
}
