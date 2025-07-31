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
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"]
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "300000"), // 15 minutes
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "500"), // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use("/api/", limiter)

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

// API routes
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
