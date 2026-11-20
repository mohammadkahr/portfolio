/** Renders public/og-image.png (1200×630 social card) from profile.json. */
import { writeFile } from 'node:fs/promises'
import { localizeDeep, getLocaleConfig } from '../../src/lib/content.js'
import { fonts, esc } from './template.mjs'

export async function renderOgImage(browser, profile, file) {
  const cfg = getLocaleConfig(profile)
  const d = localizeDeep(profile, cfg.fallback, cfg)
  const p = d.personal
  const host = String(d.meta?.siteUrl ?? '').replace(/^https?:\/\//, '')
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${fonts()}
  *{box-sizing:border-box;margin:0}
  body{width:1200px;height:630px;background:#0c0d10;color:#ededec;font-family:'Geist',sans-serif;position:relative;overflow:hidden}
  .grid{position:absolute;inset:0;background-image:linear-gradient(to right,#ffffff0d 1px,transparent 1px),linear-gradient(to bottom,#ffffff0d 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 80% 80% at 80% 0%,#000 20%,transparent 70%)}
  .wrap{position:absolute;inset:72px;display:flex;flex-direction:column;justify-content:space-between}
  .top{display:flex;align-items:center;gap:16px;font-size:22px;color:#a1a1a8}
  .logo{width:52px;height:52px;border-radius:12px;background:#ededec;color:#0c0d10;display:grid;place-items:center;font-weight:700;font-size:20px;position:relative}
  .logo i{position:absolute;top:-4px;right:-4px;width:14px;height:14px;border-radius:50%;background:#8fa6ff;border:3px solid #0c0d10}
  h1{font-family:'Newsreader',Georgia,serif;font-size:100px;line-height:.98;letter-spacing:-.025em;font-weight:420}
  .role{margin-top:26px;font-size:27px;color:#a1a1a8}.role b{color:#8fa6ff;font-weight:500}
  .bottom{display:flex;justify-content:space-between;font-size:20px;color:#6e6e76;border-top:1px solid #222225;padding-top:24px}
  </style></head><body><div class="grid"></div><div class="wrap">
  <div class="top"><div class="logo">${esc(p.initials)}<i></i></div>${esc(host)}</div>
  <div><h1>${esc(p.name)}</h1><div class="role"><b>${esc(p.role)}</b> — ${esc(p.headline)}</div></div>
  <div class="bottom"><span>${esc((p.focus ?? []).slice(0, 3).join('  ·  '))}</span><span>${esc(p.location)}</span></div>
  </div></body></html>`
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  try {
    await page.setContent(html, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    await writeFile(file, await page.screenshot({ type: 'png' }))
  } finally {
    await page.close()
  }
}
