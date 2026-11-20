<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '../ui/AppIcon.vue'
import ThemeToggle from '../ui/ThemeToggle.vue'
import LocaleSwitch from '../ui/LocaleSwitch.vue'
import { useProfile } from '@/composables/useProfile.js'
import { useLocale } from '@/composables/useLocale.js'
import { useActiveSection } from '@/composables/useActiveSection.js'

const { data, t, resumeUrl } = useProfile()
const { path } = useLocale()
const route = useRoute()

const NAV = ['about', 'research', 'experience', 'projects', 'contact']
const items = computed(() =>
  NAV.filter((id) => {
    const d = data.value
    if (id === 'research') return d.publications?.length || d.articles?.length
    if (id === 'projects') return d.projects?.length
    return true
  }).map((id) => ({ id, label: t(`nav.${id}`), to: `${path('/')}#${id}`.replace('//#', '/#') }))
)

const isHome = computed(() => route.meta.page === 'home')
const active = useActiveSection(NAV)
const scrolled = ref(false)
const open = ref(false)

const onScroll = () => (scrolled.value = window.scrollY > 8)
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
watch(() => route.fullPath, () => (open.value = false))
watch(open, (v) => document.documentElement.classList.toggle('overflow-hidden', v))
const onKey = (e) => e.key === 'Escape' && (open.value = false)
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300"
    :class="scrolled || open ? 'border-line bg-bg/80 backdrop-blur-xl backdrop-saturate-150' : 'border-transparent'"
    @keydown="onKey"
  >
    <div class="container-page flex h-16 items-center justify-between gap-4">
      <RouterLink :to="path('/')" class="group flex items-center gap-3" :aria-label="data.personal.name">
        <span class="relative grid size-8 place-items-center overflow-visible rounded-lg bg-fg font-mono text-[0.7rem] font-bold text-bg transition-transform duration-500 ease-out-expo group-hover:-rotate-6">
          <img v-if="data.personal.avatar" :src="data.personal.avatar" :alt="data.personal.name" class="size-full rounded-lg object-cover" width="32" height="32" />
          <span v-else>{{ data.personal.initials }}</span>
          <span class="absolute -end-0.5 -top-0.5 size-2 rounded-full bg-accent ring-2 ring-bg" aria-hidden="true" />
        </span>
        <span class="hidden text-sm font-medium tracking-tight sm:block">{{ data.personal.shortName }}</span>
      </RouterLink>

      <nav aria-label="Primary" class="hidden md:block">
        <ul class="flex items-center gap-1">
          <li v-for="item in items" :key="item.id">
            <RouterLink
              :to="item.to"
              class="relative rounded-md px-3 py-1.5 text-[0.84rem] transition-colors"
              :class="isHome && active === item.id ? 'text-fg' : 'text-muted hover:text-fg'"
              :aria-current="isHome && active === item.id ? 'location' : undefined"
            >
              {{ item.label }}
              <span
                class="absolute inset-x-3 -bottom-[17px] h-px bg-accent transition-transform duration-500 ease-out-expo"
                :class="isHome && active === item.id ? 'scale-x-100' : 'scale-x-0'"
                aria-hidden="true"
              />
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-0.5">
        <LocaleSwitch />
        <ThemeToggle />
        <a :href="resumeUrl()" class="btn btn-ghost ms-2 hidden h-9 px-3 text-[0.82rem] sm:inline-flex" download>
          <AppIcon name="download" :size="14" />
          {{ t('hero.resume') }}
        </a>
        <button
          type="button"
          class="icon-btn md:hidden"
          :aria-expanded="open"
          aria-controls="mobile-nav"
          :aria-label="open ? t('nav.close') : t('nav.menu')"
          @click="open = !open"
        >
          <AppIcon :name="open ? 'close' : 'menu'" :size="18" />
        </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-300 ease-out-expo"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <nav v-if="open" id="mobile-nav" aria-label="Mobile" class="h-[calc(100dvh-4rem)] border-t border-line bg-bg md:hidden">
        <ul class="container-page flex flex-col py-6">
          <li v-for="(item, i) in items" :key="item.id">
            <RouterLink :to="item.to" class="flex items-baseline gap-4 border-b border-line py-4 text-2xl font-medium tracking-tight" @click="open = false">
              <span class="font-mono text-xs text-accent tabular-nums">{{ String(i + 1).padStart(2, '0') }}</span>
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
        <div class="container-page">
          <a :href="resumeUrl()" class="btn btn-primary w-full justify-center" download>
            <AppIcon name="download" :size="15" /> {{ t('hero.resume') }}
          </a>
        </div>
      </nav>
    </Transition>
  </header>
</template>
