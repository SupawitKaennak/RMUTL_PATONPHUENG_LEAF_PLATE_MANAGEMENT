import type { Request, Response, NextFunction } from "express"
import crypto from "crypto"

const CSRF_COOKIE_NAME = "csrfToken"
const CSRF_HEADER_NAME = "x-csrf-token"

export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString("hex")
}

export const setCsrfCookie = (res: Response) => {
  const isProduction = process.env.NODE_ENV === "production"
  const token = generateCsrfToken()
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // double submit cookie pattern requires readable cookie
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge: 30 * 60 * 1000, // 30 minutes
    path: "/",
    // ไม่ตั้ง domain เพื่อให้ cookies ทำงานกับทั้ง localhost และ 127.0.0.1
  })
  return token
}

// CSRF protection using Double Submit Cookie pattern
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip safe methods and preflight
  const method = req.method.toUpperCase()
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return next()
  }

  // Allowlist specific paths that must work before CSRF exists
  const path = req.path || ""
  if (
    path.startsWith("/api/auth/login") ||
    path.startsWith("/api/auth/register") ||
    path.startsWith("/api/auth/csrf")
  ) {
    return next()
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME]
  const headerToken = (req.headers[CSRF_HEADER_NAME] || req.headers[CSRF_HEADER_NAME.toUpperCase()]) as string | undefined

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ success: false, error: "Invalid CSRF token" })
    return
  }

  next()
}

export const getCsrfCookieName = () => CSRF_COOKIE_NAME
export const getCsrfHeaderName = () => CSRF_HEADER_NAME


