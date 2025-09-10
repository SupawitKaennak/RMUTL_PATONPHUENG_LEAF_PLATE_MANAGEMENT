/**
 * Cookie utility functions for secure token management
 * Provides methods to get, set, and remove cookies with security options
 */

interface CookieOptions {
  expires?: Date
  maxAge?: number
  path?: string
  domain?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null // Server-side rendering
  }

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift()
    return cookieValue || null
  }
  
  return null
}

/**
 * Set a cookie with security options
 */
export const setCookie = (
  name: string, 
  value: string, 
  options: CookieOptions = {}
): void => {
  if (typeof document === 'undefined') {
    return // Server-side rendering
  }

  const {
    expires,
    maxAge,
    path = '/',
    domain,
    secure = true, // Default to secure for production
    httpOnly = false, // Cannot be set to true from client-side
    sameSite = 'strict'
  } = options

  let cookieString = `${name}=${value}`

  if (expires) {
    cookieString += `; expires=${expires.toUTCString()}`
  }

  if (maxAge !== undefined) {
    cookieString += `; max-age=${maxAge}`
  }

  cookieString += `; path=${path}`

  if (domain) {
    cookieString += `; domain=${domain}`
  }

  if (secure && window.location.protocol === 'https:') {
    cookieString += '; secure'
  }

  if (httpOnly) {
    console.warn('httpOnly cannot be set from client-side JavaScript')
  }

  cookieString += `; samesite=${sameSite}`

  document.cookie = cookieString
}

/**
 * Remove a cookie by setting it to expire in the past
 */
export const removeCookie = (name: string, path: string = '/'): void => {
  if (typeof document === 'undefined') {
    return // Server-side rendering
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; samesite=strict`
}

/**
 * Check if cookies are available (client-side only)
 */
export const areCookiesAvailable = (): boolean => {
  if (typeof document === 'undefined') {
    return false
  }

  try {
    const testCookie = 'test-cookie-availability'
    setCookie(testCookie, 'test', { maxAge: 1 })
    const isAvailable = getCookie(testCookie) === 'test'
    removeCookie(testCookie)
    return isAvailable
  } catch (error) {
    console.warn('Cookies are not available:', error)
    return false
  }
}

/**
 * Auth-specific cookie functions
 */
export const authCookies = {
  /**
   * Set authentication token cookie
   */
  setToken: (token: string, maxAge: number = 30 * 60): void => {
    setCookie('authToken', token, {
      maxAge,
      secure: true,
      sameSite: 'strict',
      path: '/'
    })
  },

  /**
   * Get authentication token from cookie
   */
  getToken: (): string | null => {
    return getCookie('authToken')
  },

  /**
   * Set token expiry time cookie
   */
  setTokenExpiry: (expiryTime: number): void => {
    setCookie('tokenExpiry', expiryTime.toString(), {
      maxAge: 30 * 60, // 30 minutes
      secure: true,
      sameSite: 'strict',
      path: '/'
    })
  },

  /**
   * Get token expiry time from cookie
   */
  getTokenExpiry: (): number | null => {
    const expiry = getCookie('tokenExpiry')
    return expiry ? parseInt(expiry, 10) : null
  },

  /**
   * Remove all authentication cookies
   */
  clearAuth: (): void => {
    removeCookie('authToken')
    removeCookie('tokenExpiry')
  }
}
