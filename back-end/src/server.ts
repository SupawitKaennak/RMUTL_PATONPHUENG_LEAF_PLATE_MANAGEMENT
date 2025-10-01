import express from "express"
import cors from "cors"
import hpp from "hpp"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import cookieParser from "cookie-parser"
import { env } from "./config/env"
import { csrfProtection } from "./middleware/csrf"

// Import routes
import authRouter from "./routes/auth"
import materialsRouter from "./routes/materials"
import materialHistoryRouter from "./routes/material-history"
import ordersRouter from "./routes/orders"
import transactionsRouter from "./routes/transactions"
import adminRouter from "./routes/admin"

// Import middleware
import { errorHandler } from "./middleware/error-handler"
import { notFound } from "./middleware/not-found"

const app = express()
const PORT = env.PORT

// Security middleware
// Trust only local reverse proxies (loopback). Adjust in production to your proxy subnets.
app.set('trust proxy', 'loopback')
app.use(helmet({
  // In dev, disable CSP to avoid Next dev inline/eval conflicts; in prod, set a basic CSP
  contentSecurityPolicy: env.NODE_ENV === 'production' ? {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "blob:"],
      "font-src": ["'self'", "data:"],
      "connect-src": ["'self'", "http://localhost:3000"],
      "frame-ancestors": ["'none'"],
      "base-uri": ["'self'"],
    },
  } : false,
  crossOriginEmbedderPolicy: false,
}))

// Prevent HTTP Parameter Pollution
app.use(hpp())

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true) // allow non-browser clients
      if (env.ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
      return callback(new Error("CORS: Origin not allowed"))
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "Retry-After"],
    optionsSuccessStatus: 204,
  }),
)

// Rate limiting configurations
// Different limits for development and production
const isDevelopment = env.NODE_ENV === 'development'

const generalLimiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || (isDevelopment ? "30000" : "60000")), // 30s dev, 1min prod
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (isDevelopment ? "200" : "100")), // 200 dev, 100 prod
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "Please wait a few minutes before trying again.",
    limit: "Rate limit exceeded"
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
  // Skip rate limiting for health check endpoint
  skip: (req) => req.path === '/health',
  // More lenient in development
  skipSuccessfulRequests: isDevelopment,
})

// Stricter rate limiting for authentication endpoints to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 50 : 20, // More lenient in development
  message: {
    error: "Too many authentication attempts, please try again later.",
    retryAfter: "Please wait 15 minutes before trying again.",
    limit: "Authentication rate limit exceeded"
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
})

// Very lenient limiter for development
const devLimiter = rateLimit({
  windowMs: 10000, // 10 seconds
  max: 1000, // Very high limit for development
  message: {
    error: "Development rate limit exceeded (this should rarely happen)",
    retryAfter: "Please wait 10 seconds before trying again.",
    limit: "Development rate limit exceeded"
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
})

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Cookie parsing middleware
app.use(cookieParser())

// CSRF protection for state-changing routes
app.use(csrfProtection)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// Apply rate limiting to specific routes
if (isDevelopment) {
  // Use very lenient rate limiting in development
  app.use("/api/auth", authLimiter) // Still keep auth protection
  app.use("/api/materials", devLimiter)
  app.use("/api/material-history", devLimiter)
  app.use("/api/orders", devLimiter)
  app.use("/api/transactions", devLimiter)
  app.use("/api/admin", devLimiter)
} else {
  // Use normal rate limiting in production
  app.use("/api/auth", authLimiter)
  app.use("/api/materials", generalLimiter)
  app.use("/api/material-history", generalLimiter)
  app.use("/api/orders", generalLimiter)
  app.use("/api/transactions", generalLimiter)
  app.use("/api/admin", generalLimiter)
}

// API routes
app.use("/api/auth", authRouter)
app.use("/api/materials", materialsRouter)
app.use("/api/material-history", materialHistoryRouter)
app.use("/api/orders", ordersRouter)
app.use("/api/transactions", transactionsRouter)
app.use("/api/admin", adminRouter)

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${env.NODE_ENV}`)
  console.log(`🔒 JWT Secret configured: ${env.JWT_SECRET ? 'Yes' : 'No'}`)
  console.log(`🔐 JWT Expires In: ${env.JWT_EXPIRES_IN}`)
  console.log(`🌐 CORS Origins: ${env.ALLOWED_ORIGINS.join(', ')}`)
  console.log(`⚡ Rate Limiting: ${isDevelopment ? 'Development Mode (Very Lenient)' : 'Production Mode (Standard)'}`)
  if (isDevelopment) {
    console.log(`📊 Dev Rate Limit: 1000 requests per 10 seconds`)
  } else {
    console.log(`📊 Prod Rate Limit: ${process.env.RATE_LIMIT_MAX_REQUESTS || '100'} requests per ${process.env.RATE_LIMIT_WINDOW_MS || '60000'}ms`)
  }
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
})

export default app
