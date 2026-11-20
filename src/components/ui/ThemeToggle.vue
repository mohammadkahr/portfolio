<script setup>
import { onMounted, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { useTheme } from '@/composables/useTheme.js'
import { useProfile } from '@/composables/useProfile.js'

const { isDark, toggle } = useTheme()
const { t } = useProfile()
const mounted = ref(false)
onMounted(() => (mounted.value = true))
</script>

<template>
  <button type="button" class="icon-btn relative overflow-hidden" :aria-label="t('theme.toggle')" :aria-pressed="mounted ? isDark : undefined" @click="toggle">
    <span class="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out-expo" :class="mounted && isDark ? 'translate-y-0 rotate-0 opacity-100' : '-translate-y-6 -rotate-90 opacity-0'">
      <AppIcon name="moon" />
    </span>
    <span class="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out-expo" :class="mounted && isDark ? 'translate-y-6 rotate-90 opacity-0' : 'translate-y-0 rotate-0 opacity-100'">
      <AppIcon name="sun" />
    </span>
  </button>
</template>
