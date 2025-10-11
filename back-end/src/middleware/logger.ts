/* Simple structured security logger. Replace with a real logger in production. */
export type SecurityEventType =
  | "auth.login.success"
  | "auth.login.failure"
  | "auth.login.locked"
  | "auth.logout"
  | "auth.register.success"
  | "auth.register.failure"
  | "admin.user.created"
  | "admin.user.updated"
  | "admin.user.deleted"
  | "admin.user.password_reset"

export function logSecurityEvent(event: SecurityEventType, details: Record<string, unknown>) {
  const payload = {
    ts: new Date().toISOString(),
    event,
    ...details,
  }
  // eslint-disable-next-line no-console
  console.log("[SECURITY]", JSON.stringify(payload))
}


