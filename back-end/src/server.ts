import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"
import path from "path"
import fs from "fs"

// ตรวจสอบและโหลด environment variables
const envPath = path.resolve(process.cwd(), ".env")
const envLocalPath = path.resolve(process.cwd(), ".env.local")

// ลองโหลด .env.local ก่อน ถ้าไม่มีให้ใช้ .env
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath })
  console.log("📁 Using .env.local configuration")
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
  console.log("📁 Using .env configuration")
} else {
  console.warn("⚠️  No .env or .env.local file found. Using system environment variables.")
  dotenv.config() // โหลดจาก system environment variables
}

// Import routes
import authRouter from "./routes/auth"
import materialsRouter from "./routes/materials"
import materialHistoryRouter from "./routes/material-history"
import ordersRouter from "./routes/orders"
import transactionsRouter from "./routes/transactions"

// Import middleware
import { errorHandler } from "./middleware/error-handler"
import { notFound } from "./middleware/not-found"

const app = express()
const PORT = process.env.PORT || 8000

// Security middleware
app.use(helmet())

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000", "http://127.0.0.1:3000"]
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Rate limiting configurations
// This helps prevent DDoS attacks by limiting the number of requests from each IP
const generalLimiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes (900,000ms)
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "1000"), // limit each IP to 1000 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "Please wait a few minutes before trying again.",
    limit: "Rate limit exceeded"
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health check endpoint
  skip: (req) => req.path === '/health',
})

// Stricter rate limiting for authentication endpoints to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for auth endpoints (login/register)
  message: {
    error: "Too many authentication attempts, please try again later.",
    retryAfter: "Please wait 15 minutes before trying again.",
    limit: "Authentication rate limit exceeded"
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// Apply rate limiting to specific routes
app.use("/api/auth", authLimiter) // Stricter for auth endpoints
app.use("/api/materials", generalLimiter)
app.use("/api/material-history", generalLimiter)
app.use("/api/orders", generalLimiter)
app.use("/api/transactions", generalLimiter)

// API routes
app.use("/api/auth", authRouter)
app.use("/api/materials", materialsRouter)
app.use("/api/material-history", materialHistoryRouter)
app.use("/api/orders", ordersRouter)
app.use("/api/transactions", transactionsRouter)

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  //console.log(`📁 Using config file: .env.local`)
})

export default app
