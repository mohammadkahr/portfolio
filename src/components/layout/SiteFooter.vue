<script setup>
import AppIcon from '../ui/AppIcon.vue'
import { useProfile } from '@/composables/useProfile.js'

const { data, t, num } = useProfile()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-line">
    <div class="container-page flex flex-col gap-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-1">
        <p class="text-fg">© {{ num(year) }} {{ data.personal.name }}</p>
        <p class="text-xs text-subtle">{{ t('footer.built') }}</p>
      </div>
      <div class="flex items-center gap-1">
        <a
          v-for="s in data.social"
          :key="s.id"
          :href="s.url"
          target="_blank"
          rel="noopener noreferrer me"
          class="icon-btn"
          :aria-label="s.label"
        >
          <AppIcon :name="s.icon" :size="16" />
        </a>
        <a href="#main" class="icon-btn ms-2 border border-line" :aria-label="t('footer.top')">
          <AppIcon name="arrow-up" :size="15" />
        </a>
      </div>
    </div>
  </footer>
</template>
