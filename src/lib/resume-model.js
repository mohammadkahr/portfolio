/**
 * Builds the data model used to render a resume for one locale.
 *
 *   profile.json  ──localize──▶  site data  ──resumeOverrides.common──▶
 *                 ──resumeOverrides[locale]──▶  limits  ──▶  resume model
 *
 * The website never calls this, so overrides can freely rewrite, hide or
 * extend resume content without touching the portfolio.
 */
import { localizeDeep, getLocaleConfig, getResumeSettings } from './content.js'
import { deepMerge } from './overrides.js'

const omit = (obj = {}, key) => {
  const { [key]: _drop, ...rest } = obj
  return rest
}

export function buildResumeModel(profile, locale) {
  const cfg = getLocaleConfig(profile)
  const { resumeOverrides = {}, articles, ui, ...source } = profile

  let data = localizeDeep(source, locale, cfg)
  data = deepMerge(data, localizeDeep(omit(resumeOverrides.common, 'resume'), locale, cfg))
  data = deepMerge(data, localizeDeep(omit(resumeOverrides[locale], 'resume'), locale, cfg))

  const settings = getResumeSettings(profile, locale)
  for (const [key, n] of Object.entries(settings.limits ?? {})) {
    if (Array.isArray(data[key])) data[key] = data[key].slice(0, n)
  }
  const sections = (settings.sections ?? []).filter((s) => !(settings.hide ?? []).includes(s))
  return { locale, data, settings: { ...settings, sections } }
}
