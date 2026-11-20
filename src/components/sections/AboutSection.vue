<script setup>
import SectionShell from '../ui/SectionShell.vue'
import { useProfile } from '@/composables/useProfile.js'

defineProps({ index: { type: String, default: '' } })
const { data, t } = useProfile()
</script>

<template>
  <SectionShell id="about" :index="index" :label="t('section.about')" :title="t('section.about.title')">
    <div class="grid gap-12 xl:grid-cols-[minmax(0,1fr)_260px]">
      <div class="space-y-5 text-[1.075rem] leading-relaxed text-pretty text-muted">
        <p v-for="(para, i) in data.personal.about" :key="i" v-reveal="i * 60" :class="i === 0 && 'text-fg'">{{ para }}</p>
      </div>
      <aside v-if="data.personal.focus?.length" v-reveal="120">
        <h3 class="eyebrow mb-4">{{ t('focus') }}</h3>
        <ul class="divide-y divide-line border-y border-line">
          <li v-for="(f, i) in data.personal.focus" :key="f" class="flex items-baseline gap-3 py-3 text-sm">
            <span class="font-mono text-[0.7rem] text-accent tabular-nums">{{ String(i + 1).padStart(2, '0') }}</span>
            {{ f }}
          </li>
        </ul>
      </aside>
    </div>
  </SectionShell>
</template>
