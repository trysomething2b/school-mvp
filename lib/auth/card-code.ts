/** Auto-format a card code to PREFIX-DDDD as the user types.
 *
 * Supports any prefix length (e.g. HQ-0001, CCS-0001):
 * keeps the last 4 digits as the suffix, everything before as the prefix.
 */
export function formatCardCode(raw: string): string {
  const alnum = raw.toUpperCase().replace(/[^A-Z0-9]/g, "")
  if (alnum.length <= 4) return alnum
  return `${alnum.slice(0, alnum.length - 4)}-${alnum.slice(-4)}`
}
