import { computed, unref } from 'vue'
import { useHead, useSeoMeta } from '@unhead/vue'
import { useRoute } from 'vue-router'
import profile from '~profile'
import { useLocale, localizePath, stripLocale } from './useLocale.js'
import { useProfile } from './useProfile.js'

const site = String(profile.meta?.siteUrl ?? '').replace(/\/$/, '')
// Pages are pre-rendered as nested index.html files, so canonical URLs end in "/".
const withSlash = (p) => (p.endsWith('/') ? p : `${p}/`)
const abs = (p) => (/^https?:/.test(p) ? p : site + withSlash(p))

/**
 * Per-page head: title, description, canonical, hreflang alternates,
 * Open Graph / Twitter, <html lang dir>, and JSON-LD structured data.
 */
export function useSeo(options = {}) {
  const route = useRoute()
  const { locale, dir, locales, fallback } = useLocale()
  const { data } = useProfile()

  const title = computed(() => {
    const t = unref(options.title)
    return t ? `${t} — ${data.value.personal.name}` : data.value.seo.title
  })
  const description = computed(() => unref(options.description) || data.value.seo.description)
  const url = computed(() => abs(route.path))
  const image = computed(() => abs(unref(options.image) || profile.meta?.ogImage || '/og-image.png'))

  useHead({
    htmlAttrs: { lang: locale, dir },
    link: computed(() => [
      { rel: 'canonical', href: url.value },
      ...locales.map((l) => ({ rel: 'alternate', hreflang: l, href: abs(localizePath(route.path, l)) })),
      { rel: 'alternate', hreflang: 'x-default', href: abs(localizePath(stripLocale(route.path), fallback)) }
    ]),
    meta: computed(() => [
      { name: 'theme-color', content: profile.meta?.themeColor?.light, media: '(prefers-color-scheme: light)' },
      { name: 'theme-color', content: profile.meta?.themeColor?.dark, media: '(prefers-color-scheme: dark)' },
      { name: 'keywords', content: (data.value.seo.keywords ?? []).join(', ') },
      { name: 'author', content: data.value.personal.name }
    ]),
    script: computed(() => [
      { type: 'application/ld+json', key: 'ld-json', innerHTML: JSON.stringify(unref(options.jsonLd) ?? personLd(data.value, url.value)) }
    ])
  })

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: url,
    ogImage: image,
    ogType: computed(() => unref(options.type) || 'website'),
    ogLocale: computed(() => (locale.value === 'fa' ? 'fa_IR' : 'en_US')),
    ogSiteName: computed(() => data.value.personal.name),
    twitterCard: 'summary_large_image',
    twitterSite: profile.meta?.twitterHandle || undefined
  })
}

export function personLd(d, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: d.personal.name,
    jobTitle: d.personal.role,
    description: d.personal.summary,
    url,
    email: d.contact?.email ? `mailto:${d.contact.email}` : undefined,
    address: { '@type': 'PostalAddress', addressLocality: d.personal.location },
    alumniOf: [...new Set((d.education ?? []).map((e) => e.institution))].map((name) => ({ '@type': 'CollegeOrUniversity', name })),
    knowsAbout: (d.skills ?? []).flatMap((g) => g.items.map((i) => i.name)),
    sameAs: (d.social ?? []).map((s) => s.url)
  }
}

export { abs as absoluteUrl }
