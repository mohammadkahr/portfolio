/**
 * v-reveal: fade/slide elements in when they enter the viewport.
 * Usage: v-reveal or v-reveal="120" (delay in ms).
 * Content stays visible when JS is disabled or motion is reduced (see main.css).
 */
let observer
const getObserver = () =>
  (observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  ))

export const reveal = {
  getSSRProps: () => ({ 'data-reveal': '' }),
  mounted(el, { value }) {
    el.setAttribute('data-reveal', '')
    if (value) el.style.setProperty('--reveal-delay', `${value}ms`)
    if (!('IntersectionObserver' in window)) return el.classList.add('is-visible')
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  }
}
