#!/usr/bin/env node
/**
 * Sanity-checks profile.json:
 *  - valid JSON, required fields present
 *  - unique ids / slugs per collection
 *  - every localized map has every locale (warns on missing translations)
 *  - resumeOverrides only reference ids that exist
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getLocaleConfig, isLocalizedMap } from '../src/lib/content.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
let profile
try {
  profile = JSON.parse(readFileSync(resolve(ROOT, 'profile.json'), 'utf8'))
} catch (e) {
  console.error(`✗ profile.json is not valid JSON: ${e.message}`)
  process.exit(1)
}

const { locales } = getLocaleConfig(profile)
const errors = []
const warnings = []

for (const path of ['meta.siteUrl', 'personal.name', 'personal.role', 'contact.email']) {
  if (path.split('.').reduce((o, k) => o?.[k], profile) == null) errors.push(`missing required field "${path}"`)
}

const COLLECTIONS = ['social', 'skills', 'experience', 'education', 'publications', 'projects', 'articles', 'achievements']
for (const key of COLLECTIONS) {
  const seen = new Set()
  for (const [i, item] of (profile[key] ?? []).entries()) {
    if (!item.id) errors.push(`${key}[${i}] has no "id"`)
    else if (seen.has(item.id)) errors.push(`${key}: duplicate id "${item.id}"`)
    seen.add(item.id)
  }
}
const slugs = (profile.articles ?? []).map((a) => a.slug)
if (new Set(slugs).size !== slugs.length) errors.push('articles: duplicate slug')
for (const a of profile.articles ?? []) {
  if (a.type === 'external' && !a.url) errors.push(`articles.${a.id}: external article needs "url"`)
  if (a.type !== 'external' && !a.content) warnings.push(`articles.${a.id}: internal article has no "content"`)
}

;(function walk(value, path) {
  if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${path}[${i}]`))
  if (value && typeof value === 'object') {
    if (isLocalizedMap(value, locales)) {
      const missing = locales.filter((l) => value[l] == null || value[l] === '')
      if (missing.length) warnings.push(`${path}: missing translation for ${missing.join(', ')}`)
      return
    }
    for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k)
  }
})(profile, '')

for (const [scope, patch] of Object.entries(profile.resumeOverrides ?? {})) {
  if (scope !== 'common' && !locales.includes(scope)) warnings.push(`resumeOverrides.${scope}: unknown locale`)
  for (const [key, ops] of Object.entries(patch ?? {})) {
    if (!COLLECTIONS.includes(key) || !ops || typeof ops !== 'object') continue
    const ids = new Set((profile[key] ?? []).map((i) => i.id))
    const refs = [...(ops.$only ?? []), ...(ops.$hide ?? []), ...Object.keys(ops.$patch ?? {})]
    for (const id of refs) if (!ids.has(id)) errors.push(`resumeOverrides.${scope}.${key} references unknown id "${id}"`)
  }
}

warnings.forEach((w) => console.warn(`⚠ ${w}`))
errors.forEach((e) => console.error(`✗ ${e}`))
if (errors.length) process.exit(1)
console.log(`✓ profile.json OK (${locales.join(', ')})${warnings.length ? ` with ${warnings.length} warning(s)` : ''}`)
