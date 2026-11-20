<script setup>
import { computed } from 'vue'
import AppIcon from '../ui/AppIcon.vue'
import SectionShell from '../ui/SectionShell.vue'
import { useProfile } from '@/composables/useProfile.js'

defineProps({ index: { type: String, default: '' } })
const { data, t, num } = useProfile()

const projects = computed(() => data.value.projects ?? [])
const primaryLink = (p) => p.links?.demo || p.links?.repo
</script>

<template>
  <SectionShell id="projects" :index="index" :label="t('section.projects')" :title="t('section.projects.title')">
    <ul class="grid gap-4 md:grid-cols-2">
      <li v-for="(p, i) in projects" :key="p.id" v-reveal="(i % 2) * 80">
        <article class="card card-interactive group relative flex h-full flex-col p-6">
          <header class="flex items-start justify-between gap-4">
            <p class="font-mono text-xs text-subtle tabular-nums">
              <template v-if="p.year">{{ num(p.year) }}</template>
              <a v-else-if="p.links?.demo" :href="p.links.demo" target="_blank" rel="noopener noreferrer" class="relative z-10 hover:text-fg" dir="ltr">{{ p.links.demo.replace(/^https?:\/\//, '') }}</a>
            </p>
            <div class="relative z-10 -me-2 -mt-2 flex items-center">
              <a v-if="p.links?.repo" :href="p.links.repo" target="_blank" rel="noopener noreferrer" class="icon-btn size-8" :aria-label="`${p.name} — ${t('project.repo')}`">
                <AppIcon name="github" :size="15" />
              </a>
              <a v-if="p.links?.dataset" :href="p.links.dataset" target="_blank" rel="noopener noreferrer" class="icon-btn size-8" :aria-label="`${p.name} — ${t('project.dataset')}`" :title="t('project.dataset')">
                <AppIcon name="database" :size="15" />
              </a>
              <a v-if="p.links?.demo" :href="p.links.demo" target="_blank" rel="noopener noreferrer" class="icon-btn size-8" :aria-label="`${p.name} — ${t('project.demo')}`">
                <AppIcon name="arrow-up-right" :size="15" />
              </a>
              <span v-if="!primaryLink(p)" class="px-2 py-1.5 font-mono text-[0.65rem] text-subtle">{{ t('project.private') }}</span>
            </div>
          </header>

          <h3 class="mt-4 text-lg font-medium tracking-tight">
            <a v-if="primaryLink(p)" :href="primaryLink(p)" target="_blank" rel="noopener noreferrer" class="after:absolute after:inset-0 after:rounded-xl" dir="ltr">
              {{ p.name }}
            </a>
            <span v-else dir="ltr">{{ p.name }}</span>
          </h3>
          <p v-if="p.subtitle" class="mt-0.5 text-sm text-subtle">{{ p.subtitle }}</p>
          <p class="mt-3 flex-1 text-[0.94rem] leading-relaxed text-pretty text-muted">{{ p.description }}</p>

          <p v-if="p.metric" class="mt-5 flex items-baseline gap-2">
            <span class="text-2xl font-semibold tracking-tight text-accent tabular-nums">{{ num(p.metric.value) }}</span>
            <span class="text-xs text-muted">{{ p.metric.label }}</span>
          </p>

          <ul class="mt-5 flex flex-wrap gap-1.5 border-t border-line pt-5">
            <li v-for="tech in p.tech" :key="tech" class="chip group-hover:border-line-strong">{{ tech }}</li>
          </ul>
        </article>
      </li>
    </ul>

  </SectionShell>
</template>
