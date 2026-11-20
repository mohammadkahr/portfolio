import { onBeforeUnmount, onMounted, ref } from 'vue'

/** Scroll-spy: returns the id of the section currently in view. */
export function useActiveSection(ids) {
  const active = ref('')
  let observer
  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) active.value = e.target.id
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
  })
  onBeforeUnmount(() => observer?.disconnect())
  return active
}
