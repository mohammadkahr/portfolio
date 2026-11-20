<script setup>
import { useLocale } from '@/composables/useLocale.js'
import { useProfile } from '@/composables/useProfile.js'

const { otherLocales, switchPath, localeName } = useLocale()
const { t } = useProfile()

const remember = (l) => {
  try { localStorage.setItem('locale', l) } catch {}
}
</script>

<template>
  <RouterLink
    v-for="l in otherLocales"
    :key="l"
    :to="switchPath(l)"
    :hreflang="l"
    :lang="l"
    :aria-label="`${t('lang.switch')}: ${localeName(l)}`"
    class="inline-flex h-9 items-center rounded-lg px-2.5 text-[0.8rem] font-medium text-muted transition-colors hover:bg-elev hover:text-fg"
    @click="remember(l)"
  >
    {{ localeName(l) }}
  </RouterLink>
</template>
