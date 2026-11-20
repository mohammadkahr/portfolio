/** Build-time SEO helpers: pre-render route list, sitemap.xml and robots.txt. */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getLocaleConfig } from '../src/lib/content.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readProfile = () => JSON.parse(readFileSync(resolve(ROOT, 'profile.json'), 'utf8'))

const prefix = (locale, fallback) => (locale === fallback ? '' : `/${locale}`)

/** Every concrete path, grouped so alternates can reference each other. */
function pageGroups(profile) {
  const { locales, fallback } = getLocaleConfig(profile)
  const articles = (profile.articles ?? []).filter((a) => a.type !== 'external' && !a.draft)
  const pages = ['/', '/articles', ...articles.map((a) => `/articles/${a.slug}`)]
  return pages.map((page) =>
    locales.map((locale) => ({
      locale,
      path: `${prefix(locale, fallback)}${page === '/' ? '' : page}/`.replace(/\/+$/, '/'),
      lastmod: articles.find((a) => page.endsWith(`/${a.slug}`))?.date
    }))
  )
}

export function ssgRoutes() {
  // '/404' is rendered by the catch-all route and copied to 404.html for static hosts.
  return [...pageGroups(readProfile()).flat().map((p) => p.path), '/404']
}

export function writeSeoFiles() {
  const profile = readProfile()
  const site = String(profile.meta?.siteUrl ?? '').replace(/\/$/, '')
  const { fallback } = getLocaleConfig(profile)
  const urls = pageGroups(profile)
    .flatMap((group) =>
      group.map(
        (p) => `  <url>
    <loc>${site}${p.path}</loc>${p.lastmod ? `\n    <lastmod>${p.lastmod}</lastmod>` : ''}
${group.map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt.locale}" href="${site}${alt.path}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${site}${group.find((g) => g.locale === fallback).path}"/>
  </url>`
      )
    )
    .join('\n')
  const dist = resolve(ROOT, 'dist')
  writeFileSync(
    resolve(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`
  )
  writeFileSync(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`)
  const notFound = resolve(dist, '404/index.html')
  if (existsSync(notFound)) copyFileSync(notFound, resolve(dist, '404.html'))
  console.log('[seo] sitemap.xml, robots.txt, 404.html written')
}
