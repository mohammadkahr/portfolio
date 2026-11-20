/**
 * Locale-aware content helpers shared by the website (browser + SSG) and the
 * resume generator (Node). Pure functions only: no DOM, no Vue.
 *
 * Any value in profile.json may be either a plain value or a "localized map"
 * keyed by locale, e.g. { "en": "Hello", "fa": "سلام" }.
 */

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

/** True when `value` is an object whose keys are all known locales. */
export function isLocalizedMap(value, locales) {
  if (!isPlainObject(value)) return false
  const keys = Object.keys(value)
  return keys.length > 0 && keys.every((k) => locales.includes(k))
}

/**
 * Resolve every localized map in `value` (deeply) to a single locale.
 * Falls back to the default locale, then to the first available value.
 */
export function localizeDeep(value, locale, { locales, fallback }) {
  if (Array.isArray(value)) return value.map((v) => localizeDeep(v, locale, { locales, fallback }))
  if (isLocalizedMap(value, locales)) {
    const picked = value[locale] ?? value[fallback] ?? Object.values(value)[0]
    return localizeDeep(picked, locale, { locales, fallback })
  }
  if (isPlainObject(value)) {
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = localizeDeep(v, locale, { locales, fallback })
    return out
  }
  return value
}

export function getLocaleConfig(profile) {
  const locales = profile?.meta?.locales?.length ? profile.meta.locales : ['en']
  const fallback = profile?.meta?.defaultLocale ?? locales[0]
  return { locales, fallback }
}

export const RTL_LOCALES = ['fa', 'ar', 'he', 'ur', 'ps', 'ckb']
export const isRtl = (locale) => RTL_LOCALES.includes(locale)

/**
 * Website view of the profile: localized, with drafts removed and the
 * resume-only `resumeOverrides` stripped (it never affects the site).
 */
export function buildSiteModel(profile, locale) {
  const cfg = getLocaleConfig(profile)
  const { resumeOverrides, ...rest } = profile
  const model = localizeDeep(rest, locale, cfg)
  model.articles = (model.articles ?? [])
    .filter((a) => !a.draft)
    .map((a) => ({ ...a, content: joinMarkdown(a.content) }))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
  return model
}

/** Article bodies may be a string or an array of lines (friendlier in JSON). */
export function joinMarkdown(content) {
  if (Array.isArray(content)) return content.join('\n')
  return content ?? ''
}

export function readingTime(markdown, wpm = 220) {
  const words = String(markdown || '').replace(/[`#>*_|\-[\]()]/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / wpm))
}

/** Default resume settings, merged with resumeOverrides.{common,locale}.resume */
export const DEFAULT_RESUME_SETTINGS = {
  fileName: 'Resume',
  pageSize: 'A4',
  sections: ['summary', 'skills', 'experience', 'publications', 'projects', 'education', 'achievements', 'teaching', 'leadership'],
  hide: [],
  limits: {},
  labels: {},
  minScale: 0.8,
  showPhone: true,
  showLocation: true,
  accent: null
}

export function getResumeSettings(profile, locale) {
  const o = profile?.resumeOverrides ?? {}
  const cfg = getLocaleConfig(profile)
  const common = localizeDeep(o.common?.resume ?? {}, locale, cfg)
  const local = localizeDeep(o[locale]?.resume ?? {}, locale, cfg)
  return { ...DEFAULT_RESUME_SETTINGS, ...common, ...local, limits: { ...common.limits, ...local.limits }, labels: { ...common.labels, ...local.labels } }
}

/** Public URL of the generated PDF for a locale (shared by site + generator). */
export function resumeFile(profile, locale) {
  const { fileName } = getResumeSettings(profile, locale)
  return `${fileName}-${locale}.pdf`
}
