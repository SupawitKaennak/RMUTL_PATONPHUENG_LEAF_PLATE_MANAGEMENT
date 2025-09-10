"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { apiClient } from "@/services/api-client"
import { authCookies } from "@/lib/cookies"

interface User {
  id: string
  username: string
  email: string
  fullName: string
}

interface AuthResponse {
  token: string
  user: User
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string, fullName: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ตรวจสอบ token จาก cookies เมื่อ component mount
  useEffect(() => {
    const checkInitialAuth = async () => {
      const storedToken = authCookies.getToken()
      if (storedToken) {
        console.log("🔍 Found stored token, checking auth status...")
        setToken(storedToken)
        await checkAuthStatus()
      } else {
        console.log("🔍 No stored token found")
        setIsLoading(false)
      }
    }
    
    checkInitialAuth()
  }, [])

  // ตั้งค่า auto logout เมื่อ token หมดอายุ (30 นาที)
  useEffect(() => {
    if (token) {
      const tokenExpiry = authCookies.getTokenExpiry()
      if (tokenExpiry) {
        const expiryTime = tokenExpiry
        const now = Date.now()
        const timeUntilExpiry = expiryTime - now

        if (timeUntilExpiry <= 0) {
          // Token หมดอายุแล้ว
          logout()
        } else {
          // ตั้ง timer สำหรับ auto logout
          const timer = setTimeout(() => {
            logout()
          }, timeUntilExpiry)

          return () => clearTimeout(timer)
        }
      }
    }
  }, [token])

  const checkAuthStatus = async () => {
    try {
      console.log("🔍 Checking auth status...")
      const response = await apiClient.checkAuthStatus()
      if (response.success && response.data) {
        console.log("✅ Auth status valid:", response.data)
        setUser(response.data as User)
      } else {
        console.log("❌ Auth status invalid, logging out")
        logout()
      }
    } catch (error) {
      console.error("❌ Error checking auth status:", error)
      // ถ้าไม่มี token หรือ token ไม่ถูกต้อง ให้ logout
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await apiClient.login(username, password)
      
      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data as AuthResponse
        
        // บันทึก token และ expiry time ใน cookies
        const expiryTime = Date.now() + (30 * 60 * 1000) // 30 นาที
        authCookies.setToken(newToken, 30 * 60) // 30 นาที
        authCookies.setTokenExpiry(expiryTime)
        
        setToken(newToken)
        setUser(userData)
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await apiClient.register(username, email, password, fullName)
      
      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data as AuthResponse
        
        // บันทึก token และ expiry time ใน cookies
        const expiryTime = Date.now() + (30 * 60 * 1000) // 30 นาที
        authCookies.setToken(newToken, 30 * 60) // 30 นาที
        authCookies.setTokenExpiry(expiryTime)
        
        setToken(newToken)
        setUser(userData)
        return true
      }
      return false
    } catch (error) {
      console.error("Register error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authCookies.clearAuth()
    setToken(null)
    setUser(null)
    setIsLoading(false)
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

