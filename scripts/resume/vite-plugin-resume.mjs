/**
 * Vite plugin: keeps public/resume/*.pdf in sync with profile.json.
 *  - `vite build` / `vite-ssg build`: generates resumes once before bundling.
 *  - `vite` (dev): regenerates whenever profile.json is saved.
 * Generation failures are reported but never break the site build, unless
 * RESUME_STRICT=1 is set (recommended in CI).
 */
import { generateResumes, PROFILE_PATH } from './generate.mjs'

export default function resumePlugin({ enabled = process.env.SKIP_RESUME !== '1' } = {}) {
  const run = async (logger) => {
    try {
      await generateResumes()
    } catch (err) {
      if (process.env.RESUME_STRICT) throw err
      logger.warn(`\n[resume] skipped: ${err.message}\n`)
    }
  }

  let command = 'build'
  return {
    name: 'portfolio:resume',
    configResolved(config) {
      command = config.command
    },
    async buildStart() {
      // vite-ssg runs a client and a server build in the same process: generate once.
      // (The config module is evaluated twice, so the guard lives on process.env.)
      if (!enabled || command !== 'build' || this.meta.watchMode || process.env.__PORTFOLIO_RESUME_BUILT) return
      process.env.__PORTFOLIO_RESUME_BUILT = '1'
      await run(console)
    },
    configureServer(server) {
      if (!enabled) return
      server.watcher.add(PROFILE_PATH)
      let timer
      server.watcher.on('change', (file) => {
        if (file !== PROFILE_PATH) return
        clearTimeout(timer)
        timer = setTimeout(() => run(server.config.logger), 300)
      })
      // Make sure PDFs exist when the dev server starts.
      run(server.config.logger)
    }
  }
}
