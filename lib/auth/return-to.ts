/** Allow only same-origin relative paths. */
export function safeReturnTo(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value) return fallback
  if (!value.startsWith("/")) return fallback
  if (value.startsWith("//")) return fallback
  if (value.includes("://")) return fallback
  if (/[\r\n]/.test(value)) return fallback
  return value
}
