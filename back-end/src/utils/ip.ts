import type { Request } from "express"
import net from "net"

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

  // x-forwarded-for can be a comma-separated list of IPs. The first one is the client.
  if (typeof xff === "string") {
    const ips = xff.split(",").map(ip => ip.trim())
    const clientIp = ips[0]
    // Basic validation to ensure it looks like an IP
    if (clientIp && net.isIP(clientIp)) {
      return normalizeIp(clientIp)
    }
  }

  // Fallback to other headers and properties
  const candidate = (req.headers["x-real-ip"] as string | undefined) || req.ip || req.socket.remoteAddress
  return normalizeIp(candidate)
}
