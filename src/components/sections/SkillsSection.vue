<script setup>
import SectionShell from '../ui/SectionShell.vue'
import { useProfile } from '@/composables/useProfile.js'

defineProps({ index: { type: String, default: '' } })
const { data, t } = useProfile()
</script>

<template>
  <SectionShell id="skills" :index="index" :label="t('section.skills')" :title="t('section.skills.title')">
    <dl class="divide-y divide-line border-y border-line">
      <div
        v-for="(group, i) in data.skills"
        :key="group.id"
        v-reveal="i * 50"
        class="grid gap-3 py-6 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-8"
      >
        <dt class="text-sm font-medium">{{ group.category }}</dt>
        <dd>
          <ul class="flex flex-wrap gap-2">
            <li
              v-for="item in group.items"
              :key="item.name"
              class="chip cursor-default hover:border-line-strong hover:text-fg"
              :class="item.primary && 'border-line-strong text-fg'"
            >
              <span v-if="item.primary" class="size-1 rounded-full bg-accent" aria-hidden="true" />
              {{ item.name }}
              <span v-if="item.note" class="text-subtle">· {{ item.note }}</span>
            </li>
          </ul>
        </dd>
      </div>
    </dl>
  </SectionShell>
</template>
