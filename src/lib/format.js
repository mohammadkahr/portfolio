/** Date / number formatting shared by website and resume. */

const intlLocale = (locale, calendar = 'gregory') =>
  locale === 'fa' ? `fa-IR-u-ca-${calendar}-nu-arabext` : `${locale}-u-ca-${calendar}`

/** Convert ASCII digits to the locale's digits (Persian uses ۰-۹). */
export function localizeDigits(value, locale) {
  const s = String(value ?? '')
  if (locale !== 'fa') return s
  return s.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]).replace(/\./g, '٫').replace(/,/g, '٬')
}

/** "2024", "2024-07" or "2024-07-15" → localized label. */
export function formatDate(value, locale, { calendar = 'gregory', style = 'short' } = {}) {
  if (!value) return ''
  const parts = String(value).split('-').map(Number)
  if (parts.some(Number.isNaN)) return String(value)
  const [y, m, d] = parts
  // Year-only values are never converted between calendars (ambiguous).
  if (!m) return localizeDigits(y, locale)
  const date = new Date(Date.UTC(y, m - 1, d || 1))
  const opts = { year: 'numeric', month: style === 'long' ? 'long' : 'short', timeZone: 'UTC' }
  if (d) opts.day = 'numeric'
  try {
    return new Intl.DateTimeFormat(intlLocale(locale, calendar), opts).format(date)
  } catch {
    return String(value)
  }
}

export function formatRange(start, end, locale, { calendar, presentLabel } = {}) {
  const a = formatDate(start, locale, { calendar })
  const b = end ? formatDate(end, locale, { calendar }) : presentLabel
  if (!a) return b || ''
  if (a === b) return a
  return `${a} – ${b}`
}

export function prettyUrl(url) {
  return String(url || '').replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
}
