import { ref } from 'vue'

const isDark = ref(false)
let initialized = false

export function useTheme() {
  if (!initialized && typeof document !== 'undefined') {
    initialized = true
    isDark.value = document.documentElement.classList.contains('dark')
    // Follow OS changes until the user picks a theme explicitly.
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      let stored = null
      try { stored = localStorage.getItem('theme') } catch {}
      if (!stored) apply(e.matches, false)
    })
  }

  function apply(dark, persist = true) {
    isDark.value = dark
    const root = document.documentElement
    root.classList.add('theme-transition')
    root.classList.toggle('dark', dark)
    if (persist) {
      try { localStorage.setItem('theme', dark ? 'dark' : 'light') } catch {}
    }
    setTimeout(() => root.classList.remove('theme-transition'), 300)
  }

  return { isDark, toggle: () => apply(!isDark.value) }
}
