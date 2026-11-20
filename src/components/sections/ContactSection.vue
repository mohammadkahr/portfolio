<script setup>
import { ref } from 'vue'
import AppIcon from '../ui/AppIcon.vue'
import SectionShell from '../ui/SectionShell.vue'
import { useProfile } from '@/composables/useProfile.js'

defineProps({ index: { type: String, default: '' } })
const { data, t } = useProfile()
const copied = ref(false)
let timer

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(data.value.contact.email)
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (copied.value = false), 1800)
  } catch {
    window.location.href = `mailto:${data.value.contact.email}`
  }
}
</script>

<template>
  <SectionShell id="contact" :index="index" :label="t('section.contact')">
    <div class="grid gap-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div>
        <p v-reveal class="heading-serif text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.05] text-balance">
          {{ data.contact.heading }}
        </p>
        <p v-reveal="80" class="mt-6 max-w-lg leading-relaxed text-pretty text-muted">{{ data.contact.text }}</p>

        <div v-reveal="140" class="mt-10 flex flex-wrap items-center gap-3">
          <a :href="`mailto:${data.contact.email}`" class="btn btn-primary group h-12 px-5 text-[0.95rem]" dir="ltr">
            <AppIcon name="mail" :size="16" />
            {{ data.contact.email }}
          </a>
          <button type="button" class="btn btn-ghost h-12 w-12 justify-center px-0" :aria-label="t('contact.copy')" @click="copyEmail">
            <Transition mode="out-in" enter-active-class="transition duration-200" enter-from-class="scale-50 opacity-0" leave-active-class="transition duration-100" leave-to-class="scale-50 opacity-0">
              <AppIcon :key="copied ? 'y' : 'n'" :name="copied ? 'check' : 'copy'" :size="16" :class="copied && 'text-emerald-500'" />
            </Transition>
          </button>
          <span class="sr-only" role="status" aria-live="polite">{{ copied ? t('contact.copied') : '' }}</span>
          <a v-if="data.contact.showPhoneOnWebsite && data.contact.phone" :href="`tel:${data.contact.phone.replace(/\s/g, '')}`" class="link-underline text-sm text-muted" dir="ltr">{{ data.contact.phone }}</a>
        </div>
      </div>

      <div v-reveal="100">
        <h3 class="eyebrow mb-4">{{ t('contact.elsewhere') }}</h3>
        <ul class="divide-y divide-line border-y border-line">
          <li v-for="s in data.social" :key="s.id">
            <a :href="s.url" target="_blank" rel="noopener noreferrer me" class="group flex items-center gap-4 py-4">
              <span class="grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors group-hover:border-fg group-hover:bg-fg group-hover:text-bg">
                <AppIcon :name="s.icon" :size="16" />
              </span>
              <span class="flex-1">
                <span class="block text-sm font-medium">{{ s.label }}</span>
                <span class="block font-mono text-xs text-subtle" dir="ltr" :class="$route.meta.locale === 'fa' && 'text-end'">{{ s.handle }}</span>
              </span>
              <AppIcon name="arrow-up-right" :size="16" class="arrow arrow-diag text-subtle group-hover:text-fg" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  </SectionShell>
</template>
