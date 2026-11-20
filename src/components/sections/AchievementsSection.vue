<script setup>
import { computed } from 'vue'
import AppIcon from '../ui/AppIcon.vue'
import SectionShell from '../ui/SectionShell.vue'
import { useProfile } from '@/composables/useProfile.js'

defineProps({ index: { type: String, default: '' } })
const { data, t, date } = useProfile()
const groups = computed(() => [
  { key: 'certificates', icon: 'certificate', items: (data.value.achievements ?? []).filter((a) => a.type !== 'honor') },
  { key: 'honors', icon: 'award', items: (data.value.achievements ?? []).filter((a) => a.type === 'honor') }
].filter((g) => g.items.length))
</script>

<template>
  <SectionShell id="achievements" :index="index" :label="t('section.achievements')" :title="t('section.achievements.title')">
    <div class="grid gap-10 md:grid-cols-2">
      <div v-for="(g, gi) in groups" :key="g.key" v-reveal="gi * 80">
        <h3 class="eyebrow mb-4 flex items-center gap-2"><AppIcon :name="g.icon" :size="14" class="text-accent" /> {{ t(`achievements.${g.key}`) }}</h3>
        <ul class="divide-y divide-line border-y border-line">
          <li v-for="a in g.items" :key="a.id" class="flex items-baseline justify-between gap-4 py-4">
            <div class="min-w-0">
              <component :is="a.url ? 'a' : 'p'" :href="a.url" :target="a.url && '_blank'" :rel="a.url && 'noopener noreferrer'" class="text-[0.95rem] font-medium" :class="a.url && 'link-underline'">
                {{ a.title }}
              </component>
              <p v-if="a.issuer" class="mt-0.5 text-sm text-muted">{{ a.issuer }}</p>
            </div>
            <span v-if="a.detail || a.date" class="shrink-0 rounded-md bg-accent-soft px-2 py-0.5 font-mono text-[0.7rem] text-accent">
              {{ a.detail || date(a.date) }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </SectionShell>
</template>
