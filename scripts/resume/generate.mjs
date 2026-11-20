#!/usr/bin/env node
/**
 * Generates one single-page PDF resume per locale from profile.json
 * (plus public/og-image.png when meta.ogImage is "/og-image.png").
 *
 *   node scripts/resume/generate.mjs            # all locales → public/resume/
 *   node scripts/resume/generate.mjs --html     # also write the HTML to .resume-debug/
 *   node scripts/resume/generate.mjs --watch    # regenerate when profile.json changes
 *   node scripts/resume/generate.mjs --locale fa
 *
 * Env:
 *   CHROMIUM_PATH   use a specific Chrome/Chromium binary
 *   RESUME_STRICT=1 fail (exit 1) if a resume overflows one page
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { watch } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { getLocaleConfig, resumeFile } from '../../src/lib/content.js'
import { buildResumeModel } from '../../src/lib/resume-model.js'
import { renderResume } from './template.mjs'
import { renderOgImage } from './og-image.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
export const PROFILE_PATH = resolve(ROOT, 'profile.json')
const OUT_DIR = resolve(ROOT, 'public/resume')
const DEBUG_DIR = resolve(ROOT, '.resume-debug')
const MM_TO_PX = 96 / 25.4
const PAGE_HEIGHT_MM = { A4: 297, Letter: 279.4 }

const log = (...a) => console.log('\x1b[38;5;208m[resume]\x1b[0m', ...a)

async function launchBrowser() {
  let chromium
  try {
    ;({ chromium } = await import('playwright'))
  } catch {
    throw new Error('Playwright is not installed. Run `npm install` first.')
  }
  try {
    return await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
  } catch (err) {
    throw new Error(
      `Could not launch Chromium (${err.message.split('\n')[0]}).\n` +
        '  → Run `npx playwright install chromium`, or set CHROMIUM_PATH to a local Chrome/Chromium binary.'
    )
  }
}

async function setMetadata(pdfBytes, { data, locale }) {
  const { PDFDocument } = await import('pdf-lib')
  const doc = await PDFDocument.load(pdfBytes)
  const p = data.personal ?? {}
  doc.setTitle(`${p.name} — ${p.role}`, { showInWindowTitleBar: true })
  doc.setAuthor(String(p.name ?? ''))
  doc.setSubject(String(p.headline ?? p.role ?? ''))
  doc.setKeywords((data.skills ?? []).flatMap((g) => g.items.map((i) => String(i.name ?? i))))
  doc.setLanguage?.(locale === 'fa' ? 'fa-IR' : locale)
  doc.setCreator('profile.json → resume generator')
  doc.setProducer('Playwright + pdf-lib')
  return doc.save()
}

/** Render, shrink-to-fit onto one page, print, and stamp metadata. */
async function renderOne(browser, profile, locale, { html: writeHtml }) {
  const model = buildResumeModel(profile, locale)
  const html = renderResume(model)
  const page = await browser.newPage()
  try {
    await page.setContent(html, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)

    const pageHeight = (PAGE_HEIGHT_MM[model.settings.pageSize] ?? 297) * MM_TO_PX
    const minScale = Number(model.settings.minScale) || 0.8
    const scale = await page.evaluate(
      ({ pageHeight, minScale }) => {
        const el = document.querySelector('.page')
        const fits = () => el.getBoundingClientRect().height <= pageHeight - 1
        let s = 1
        document.documentElement.style.setProperty('--scale', s)
        while (!fits() && s > minScale) {
          s = Math.round((s - 0.01) * 100) / 100
          document.documentElement.style.setProperty('--scale', s)
        }
        return { s, fits: fits(), height: el.getBoundingClientRect().height }
      },
      { pageHeight, minScale }
    )

    if (!scale.fits) {
      const msg = `${locale}: content overflows one page even at scale ${scale.s}. Trim content via resumeOverrides (e.g. "limits", "$hide", "hide").`
      if (process.env.RESUME_STRICT) throw new Error(msg)
      log(`\x1b[33mwarning\x1b[0m ${msg}`)
    }

    const pdf = await page.pdf({
      format: model.settings.pageSize,
      printBackground: true,
      preferCSSPageSize: true,
      pageRanges: scale.fits ? '1' : undefined,
      tagged: true,
      outline: false
    })
    const file = resolve(OUT_DIR, resumeFile(profile, locale))
    await writeFile(file, await setMetadata(pdf, model))
    if (writeHtml) {
      await mkdir(DEBUG_DIR, { recursive: true })
      await writeFile(resolve(DEBUG_DIR, `resume-${locale}.html`), html)
    }
    log(`${locale} → ${file.replace(ROOT + '/', '')}  (scale ${scale.s}${scale.fits ? '' : ', multi-page'})`)
    return file
  } finally {
    await page.close()
  }
}

export async function generateResumes({ locales: only, html = false } = {}) {
  const profile = JSON.parse(await readFile(PROFILE_PATH, 'utf8'))
  const { locales } = getLocaleConfig(profile)
  const targets = only?.length ? locales.filter((l) => only.includes(l)) : locales
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await launchBrowser()
  try {
    const files = []
    for (const locale of targets) files.push(await renderOne(browser, profile, locale, { html }))
    if (profile.meta?.ogImage === '/og-image.png') {
      await renderOgImage(browser, profile, resolve(ROOT, 'public/og-image.png'))
      log('og → public/og-image.png')
    }
    return files
  } finally {
    await browser.close()
  }
}

// ── CLI ────────────────────────────────────────────────────────────────────
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2)
  const opts = {
    html: args.includes('--html'),
    locales: args.flatMap((a, i) => (a === '--locale' ? [args[i + 1]] : []))
  }
  const run = () =>
    generateResumes(opts).catch((err) => {
      console.error('\x1b[31m[resume]\x1b[0m', err.message)
      if (!args.includes('--watch')) process.exit(1)
    })

  await run()
  if (args.includes('--watch')) {
    log('watching profile.json …')
    let timer
    watch(PROFILE_PATH, () => {
      clearTimeout(timer)
      timer = setTimeout(run, 250)
    })
  }
}
