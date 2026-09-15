/** Derive a short Device label from a user-agent string. */
export function parseDevice(userAgent: string | null | undefined): string {
  if (!userAgent) return "Unknown"

  let os = "Unknown"
  if (/iPhone|iPad|iPod/i.test(userAgent)) os = "iPhone"
  else if (/Android/i.test(userAgent)) os = "Android"
  else if (/Mac OS X|Macintosh/i.test(userAgent)) os = "macOS"
  else if (/Windows/i.test(userAgent)) os = "Windows"
  else if (/Linux/i.test(userAgent)) os = "Linux"

  let browser = "Unknown"
  let major = ""

  const edge = userAgent.match(/Edg(?:e|A|iOS)?\/(\d+)/)
  const chrome = userAgent.match(/Chrome\/(\d+)/)
  const firefox = userAgent.match(/Firefox\/(\d+)/)
  const versionSafari = userAgent.match(/Version\/(\d+).+Safari/)
  const criOS = userAgent.match(/CriOS\/(\d+)/)
  const fxiOS = userAgent.match(/FxiOS\/(\d+)/)

  if (edge) {
    browser = "Edge"
    major = edge[1]
  } else if (criOS) {
    browser = "Chrome"
    major = criOS[1]
  } else if (fxiOS) {
    browser = "Firefox"
    major = fxiOS[1]
  } else if (chrome) {
    browser = "Chrome"
    major = chrome[1]
  } else if (firefox) {
    browser = "Firefox"
    major = firefox[1]
  } else if (versionSafari) {
    browser = "Safari"
    major = versionSafari[1]
  } else if (/Safari/i.test(userAgent)) {
    browser = "Safari"
  }

  return major ? `${os} / ${browser} ${major}` : `${os} / ${browser}`
}
