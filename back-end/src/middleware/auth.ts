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
        iat?: number
        exp?: number
      }
    }
  }
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token and adds user info to request object
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false, 
      error: "Unauthorized: Missing JWT token" 
    })
  }
  
  const token = authHeader.substring(7)
  
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      fullName: decoded.fullName,
      iat: decoded.iat,
      exp: decoded.exp
    }
    next()
  } catch (error) {
    console.error('JWT verification error:', error)
    return res.status(401).json({ 
      success: false, 
      error: "Unauthorized: Invalid or expired token" 
    })
  }
}

/**
 * Optional JWT Authentication Middleware
 * Verifies JWT token if present, but doesn't require it
 */
export const optionalAuthenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next() // Continue without authentication
  }
  
  const token = authHeader.substring(7)
  
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      fullName: decoded.fullName,
      iat: decoded.iat,
      exp: decoded.exp
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
}): string => {
  return jwt.sign(payload, env.JWT_SECRET, { 
    expiresIn: env.JWT_EXPIRES_IN 
  })
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
