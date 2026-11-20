import { computed } from 'vue'
import { useRoute } from 'vue-router'
import profile from '~profile'
import { getLocaleConfig, isRtl } from '@/lib/content.js'
import { localePrefix } from '@/router.js'

const { locales, fallback } = getLocaleConfig(profile)

/** Strip any locale prefix from a path: "/fa/articles" → "/articles". */
export function stripLocale(path) {
  for (const l of locales) {
    if (l === fallback) continue
    if (path === `/${l}` || path === `/${l}/`) return '/'
    if (path.startsWith(`/${l}/`)) return path.slice(l.length + 1)
  }
  return path || '/'
}

/** Prefix an internal path with a locale; external URLs pass through. */
export function localizePath(path, locale) {
  if (!path || /^(https?:|mailto:|tel:|#)/.test(path)) return path
  const clean = stripLocale(path)
  return (localePrefix(locale) + (clean === '/' ? '' : clean)) || '/'
}

export function useLocale() {
  const route = useRoute()
  const locale = computed(() => route.meta.locale ?? fallback)
  const dir = computed(() => (isRtl(locale.value) ? 'rtl' : 'ltr'))
  const otherLocales = computed(() => locales.filter((l) => l !== locale.value))

  return {
    locale,
    dir,
    locales,
    fallback,
    otherLocales,
    localeName: (l) => profile.meta?.localeNames?.[l] ?? l.toUpperCase(),
    path: (p) => localizePath(p, locale.value),
    /** Same page in another locale, preserving the hash. */
    switchPath: (l) => localizePath(route.path, l) + (route.hash || '')
  }
}
