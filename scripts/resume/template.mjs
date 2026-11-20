/**
 * ATS-friendly single-column resume template.
 * - Real, selectable text (no images of text, no multi-column tables)
 * - Conventional section headings, plain bullet lists, visible URLs
 * - Same type system and accent as the website
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { isRtl } from '../../src/lib/content.js'
import { formatRange, formatDate, localizeDigits, prettyUrl } from '../../src/lib/format.js'
import { RESUME_LABELS } from '../../src/lib/ui-strings.js'

const require = createRequire(import.meta.url)

const fontFace = (family, pkgFile, range) => {
  const path = require.resolve(pkgFile)
  const b64 = readFileSync(path).toString('base64')
  return `@font-face{font-family:'${family}';src:url(data:font/woff2;base64,${b64}) format('woff2');font-weight:100 900;font-style:normal;font-display:block;${range ? `unicode-range:${range};` : ''}}`
}

let fontCss
export function fonts() {
  fontCss ??= [
    fontFace('Geist', '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2'),
    fontFace('Geist', '@fontsource-variable/geist/files/geist-latin-ext-wght-normal.woff2', 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'),
    fontFace('Newsreader', '@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2'),
    fontFace('Vazirmatn', '@fontsource-variable/vazirmatn/files/vazirmatn-arabic-wght-normal.woff2'),
    fontFace('Vazirmatn', '@fontsource-variable/vazirmatn/files/vazirmatn-latin-wght-normal.woff2')
  ].join('\n')
  return fontCss
}

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

/** Minimal inline markdown: **bold**, *italic*, `code`. Input is escaped first. */
const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')

const list = (items) => (items?.length ? `<ul>${items.map((b) => `<li>${inline(b)}</li>`).join('')}</ul>` : '')

const row = (left, right) => `<div class="row"><div class="row-main">${left}</div>${right ? `<div class="row-meta">${right}</div>` : ''}</div>`

export function renderResume({ locale, data, settings }, { accent = '#2443c4' } = {}) {
  const L = { ...(RESUME_LABELS[locale] ?? RESUME_LABELS.en), ...settings.labels }
  const cal = data.meta?.calendar?.[locale] ?? 'gregory'
  const range = (a, b) => esc(formatRange(a, b, locale, { calendar: cal, presentLabel: L.present }))
  const digits = (v) => localizeDigits(v, locale)
  const p = data.personal ?? {}
  const c = data.contact ?? {}
  const rtl = isRtl(locale)
  const sep = '<span class="sep" aria-hidden="true">|</span>'

  const contactBits = [
    settings.showLocation && p.location ? esc(p.location) : null,
    settings.showPhone && c.phone ? `<span dir="ltr">${esc(c.phone)}</span>` : null,
    c.email ? `<a href="mailto:${esc(c.email)}" dir="ltr">${esc(c.email)}</a>` : null
  ].filter(Boolean)
  const linkBits = (data.social ?? [])
    .filter((s) => s.resume !== false)
    .map((s) => `<a href="${esc(s.url)}" dir="ltr">${esc(prettyUrl(s.url))}</a>`)

  const sections = {
    summary: () => (p.summary ? `<p class="summary">${inline(p.summary)}</p>` : ''),

    skills: () =>
      `<dl class="skills">${(data.skills ?? [])
        .map((g) => `<div><dt>${esc(g.category)}:</dt> <dd>${g.items.map((i) => esc(i.name ?? i)).join(' · ')}</dd></div>`)
        .join('')}</dl>`,

    experience: () =>
      (data.experience ?? [])
        .filter((e) => e.type === 'work')
        .map(
          (e) => `<article class="item">${row(
            `<h3>${esc(e.role)}</h3><span class="sub">, ${esc(e.organization)}${e.location ? ` — ${esc(e.location)}` : ''}</span>`,
            range(e.start, e.end)
          )}${list(e.bullets)}</article>`
        )
        .join(''),

    publications: () =>
      (data.publications ?? [])
        .map(
          (pub) => `<article class="item">${row(`<h3>${esc(pub.title)}</h3>`, esc(digits(pub.year)))}<div class="sub">${esc(pub.venue)}</div>${list(pub.bullets)}</article>`
        )
        .join(''),

    projects: () =>
      (data.projects ?? [])
        .map((pr) => {
          const title = `${esc(pr.name)}${pr.subtitle ? ` — ${esc(pr.subtitle)}` : ''}`
          const tech = pr.tech?.length ? `<span class="tech">${pr.tech.map(esc).join(', ')}</span>` : ''
          return `<article class="item">${row(`<h3>${title}</h3>${tech}`, esc(digits(pr.year)))}${list(pr.bullets?.length ? pr.bullets : [pr.description])}</article>`
        })
        .join(''),

    education: () =>
      (data.education ?? [])
        .map(
          (ed) => `<article class="item">${row(
            `<h3>${esc(ed.degree)}</h3><span class="sub">, ${esc(ed.institution)}${ed.gpa ? ` — ${L.gpa}: <span dir="ltr">${digits(ed.gpa.value)} / ${digits(ed.gpa.scale)}</span>` : ''}</span>`,
            range(ed.start, ed.end)
          )}${list(ed.bullets)}</article>`
        )
        .join(''),

    achievements: () => {
      const certs = (data.achievements ?? []).filter((a) => a.type !== 'honor')
      const honors = (data.achievements ?? []).filter((a) => a.type === 'honor')
      return `<ul class="tight">${certs
        .map((a) => `<li>${row(`${a.issuer ? `${esc(a.issuer)} — ` : ''}${esc(a.title)}`, a.detail ? esc(a.detail) : a.date ? esc(formatDate(a.date, locale)) : '')}</li>`)
        .join('')}${honors.length ? `<li>${honors.map((h) => esc(h.title)).join('&nbsp;&nbsp;·&nbsp;&nbsp;')}</li>` : ''}</ul>`
    },

    teaching: () =>
      (data.experience ?? [])
        .filter((e) => e.type === 'teaching')
        .map((e) => {
          // Courses are listed inline (one wrapped line) to keep the resume to one page.
          const courses = e.courses?.length
            ? `<p class="courses">${e.courses
                .map((cr) => {
                  const meta = [cr.instructor, cr.term].filter(Boolean).map(esc).join(', ')
                  return `${esc(cr.name)}${meta ? ` <span class="sub">(${meta})</span>` : ''}`
                })
                .join('<span class="sep" aria-hidden="true">·</span>')}</p>`
            : ''
          const meta = e.courses?.length ? esc(e.organization) : range(e.start, e.end)
          const sub = e.courses?.length ? '' : `<span class="sub">, ${esc(e.organization)}</span>`
          return `<article class="item">${row(`<h3>${esc(e.role)}</h3>${sub}`, meta)}${list(e.bullets)}${courses}</article>`
        })
        .join(''),

    leadership: () =>
      `<ul class="tight">${(data.experience ?? [])
        .filter((e) => e.type === 'leadership')
        .map((e) => `<li>${row(`<strong>${esc(e.role)}</strong>, ${esc(e.organization)}`, range(e.start, e.end))}</li>`)
        .join('')}</ul>`
  }

  const body = settings.sections
    .map((key) => {
      const render = sections[key]
      if (!render) return ''
      const html = render()
      if (!html || html === '<ul class="tight"></ul>') return ''
      return `<section><h2>${esc(L[key] ?? key)}</h2>${html}</section>`
    })
    .join('')

  const sansStack = rtl ? `'Vazirmatn', 'Geist', sans-serif` : `'Geist', 'Vazirmatn', sans-serif`

  return `<!doctype html>
<html lang="${locale}" dir="${rtl ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8">
<title>${esc(p.name)} — ${esc(p.role)}</title>
<meta name="author" content="${esc(p.name)}">
<style>
${fonts()}
@page { size: ${settings.pageSize}; margin: 0; }
:root { --scale: 1; --accent: ${settings.accent || accent}; --ink: #111113; --muted: #55555c; --rule: #dedcd5; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; }
body { font-family: ${sansStack}; color: var(--ink); font-size: calc(9.4pt * var(--scale)); line-height: 1.34;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; font-feature-settings: 'ss01', 'cv11'; }
.page { width: 210mm; padding: calc(10mm * var(--scale)) calc(12.5mm * var(--scale)) calc(8mm * var(--scale)); }
header { padding-bottom: calc(7pt * var(--scale)); border-bottom: 1.2pt solid var(--ink); margin-bottom: calc(6pt * var(--scale)); }
h1 { font-size: calc(${rtl ? 21 : 24}pt * var(--scale)); line-height: 1.1; margin: 0; font-weight: ${rtl ? 650 : 450}; letter-spacing: ${rtl ? '0' : '-0.015em'}; font-family: ${rtl ? 'inherit' : `'Newsreader', Georgia, serif`}; }
.title { margin-top: calc(2.5pt * var(--scale)); font-size: calc(10.5pt * var(--scale)); color: var(--muted); }
.title strong { color: var(--accent); font-weight: 600; }
.contact { margin-top: calc(4pt * var(--scale)); color: var(--muted); font-size: calc(8.8pt * var(--scale)); }
.contact a { color: inherit; text-decoration: none; }
.sep { color: var(--rule); margin: 0 0.5em; }
section { margin-top: calc(6pt * var(--scale)); }
h2 { font-size: calc(8.6pt * var(--scale)); text-transform: uppercase; letter-spacing: ${rtl ? '0' : '0.09em'}; font-weight: 650;
  color: var(--accent); margin: 0 0 calc(3.5pt * var(--scale)); padding-bottom: calc(2pt * var(--scale)); border-bottom: 0.6pt solid var(--rule); }
h3 { font-size: 1em; font-weight: 600; margin: 0; display: inline; }
.item + .item { margin-top: calc(4pt * var(--scale)); }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 10pt; }
.row-main { min-width: 0; }
.row-meta { flex-shrink: 0; color: var(--muted); font-size: 0.93em; font-variant-numeric: tabular-nums; white-space: nowrap; }
.sub { color: var(--muted); }
.tech { color: var(--muted); font-size: 0.92em; margin-inline-start: 0.6em; }
.tech::before { content: '· '; }
p { margin: 0; }
.summary { text-align: justify; }
ul { margin: calc(1.5pt * var(--scale)) 0 0; padding-inline-start: 1.1em; }
ul.tight { padding-inline-start: 1.1em; margin-top: 0; }
li { margin: calc(0.4pt * var(--scale)) 0; padding-inline-start: 0.1em; }
li::marker { color: var(--accent); }
.courses { margin-top: calc(1.5pt * var(--scale)); }
.courses .sep { margin: 0 0.45em; color: var(--muted); }
.skills { margin: 0; }
.skills div { margin: calc(1pt * var(--scale)) 0; }
dt { display: inline; font-weight: 600; }
dd { display: inline; margin: 0; }
strong { font-weight: 600; }
code { font-family: inherit; }
a { color: inherit; }
</style>
</head>
<body>
<main class="page">
<header>
<h1>${esc(p.name)}</h1>
<div class="title"><strong>${esc(p.role)}</strong>${p.headline ? `${sep}${esc(p.headline)}` : ''}</div>
<div class="contact">${contactBits.join(sep)}</div>
${linkBits.length ? `<div class="contact">${linkBits.join(sep)}</div>` : ''}
</header>
${body}
</main>
</body>
</html>`
}
