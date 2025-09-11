"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { apiClient } from "@/services/api-client"

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
  const [isLoading, setIsLoading] = useState(true)

  // ตรวจสอบสถานะ authentication เมื่อ component mount
  useEffect(() => {
    const checkInitialAuth = async () => {
      console.log("🔍 Checking initial auth status...")
      await checkAuthStatus()
    }
    
    checkInitialAuth()
  }, [])

  // ตั้งค่า auto logout เมื่อ token หมดอายุ (30 นาที)
  useEffect(() => {
    if (user) {
      // ตั้ง timer สำหรับ auto logout หลังจาก 30 นาที
      const timer = setTimeout(() => {
        console.log("⏰ Auto logout due to token expiry")
        logout()
      }, 30 * 60 * 1000) // 30 นาที

      return () => clearTimeout(timer)
    }
  }, [user])

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
        const { user: userData } = response.data as { user: User }
        
        // Backend จะตั้งค่า HttpOnly cookies อัตโนมัติ
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
        const { user: userData } = response.data as { user: User }
        
        // Backend จะตั้งค่า HttpOnly cookies อัตโนมัติ
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

  const logout = async () => {
    try {
      // เรียก logout API เพื่อลบ cookies ที่ backend
      await apiClient.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

