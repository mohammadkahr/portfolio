import { computed } from 'vue'
import profile from '~profile'
import { buildSiteModel, resumeFile } from '@/lib/content.js'
import { formatDate, formatRange, localizeDigits } from '@/lib/format.js'
import { UI_STRINGS } from '@/lib/ui-strings.js'
import { useLocale } from './useLocale.js'

const cache = new Map()
const modelFor = (locale) => {
  if (!cache.has(locale)) cache.set(locale, buildSiteModel(profile, locale))
  return cache.get(locale)
}

/** Localized, read-only view of profile.json for the current route locale. */
export function useProfile() {
  const { locale, fallback } = useLocale()
  const data = computed(() => modelFor(locale.value))
  const calendar = computed(() => profile.meta?.calendar?.[locale.value] ?? 'gregory')

  const t = (key, vars = {}) => {
    const s =
      profile.ui?.[locale.value]?.[key] ?? UI_STRINGS[locale.value]?.[key] ?? UI_STRINGS[fallback]?.[key] ?? UI_STRINGS.en[key] ?? key
    return s.replace(/\{(\w+)\}/g, (_, k) => localizeDigits(vars[k] ?? '', locale.value))
  }

  return {
    profile,
    data,
    locale,
    t,
    num: (v) => localizeDigits(v, locale.value),
    date: (v, style) => formatDate(v, locale.value, { calendar: calendar.value, style }),
    range: (a, b) => formatRange(a, b, locale.value, { calendar: calendar.value, presentLabel: t('present') }),
    resumeUrl: (l = locale.value) => `/resume/${resumeFile(profile, l)}`
  }
}
