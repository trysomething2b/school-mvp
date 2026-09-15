export type AppRole = "superadmin" | "admin" | "teacher" | "student" | string

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin" || role === "superadmin"
}

export function displayRole(role: string | null | undefined): string {
  if (!role) return "Unknown"
  if (role === "admin" || role === "superadmin") return "Admin"
  return role.charAt(0).toUpperCase() + role.slice(1)
}
