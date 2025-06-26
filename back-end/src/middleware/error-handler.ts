import type { Request, Response, NextFunction } from "express"

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", error.message)
  console.error("Stack:", error.stack)

  // Default error
  let statusCode = 500
  let message = "Internal Server Error"

  // Handle specific error types
  if (error.name === "ValidationError") {
    statusCode = 400
    message = error.message
  }

  if (error.message.includes("not found")) {
    statusCode = 404
    message = "Resource not found"
  }

  if (error.message.includes("permission")) {
    statusCode = 403
    message = "Permission denied"
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  })
}
