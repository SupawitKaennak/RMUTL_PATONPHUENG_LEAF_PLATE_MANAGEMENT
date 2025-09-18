import type { Request } from "express"

function normalizeIp(ip?: string | null): string {
  if (!ip) return "unknown"
  // IPv6 loopback
  if (ip === "::1") return "127.0.0.1"
  // IPv4-mapped IPv6, e.g., ::ffff:192.168.1.10
  const mappedMatch = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i)
  if (mappedMatch) return mappedMatch[1]
  return ip
}

export function getClientIp(req: Request): string {
  const xff = req.headers["x-forwarded-for"]
  const xri = req.headers["x-real-ip"] as string | undefined

  let fromXff: string | undefined
  if (Array.isArray(xff)) {
    fromXff = xff[0]
  } else if (typeof xff === "string") {
    fromXff = xff.split(",")[0]?.trim()
  }

  const candidate = fromXff || xri || req.ip || req.socket.remoteAddress || "unknown"
  return normalizeIp(candidate)
}


