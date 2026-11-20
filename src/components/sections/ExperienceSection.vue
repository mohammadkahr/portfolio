<script setup>
import { computed, ref } from 'vue'
import SectionShell from '../ui/SectionShell.vue'
import { useProfile } from '@/composables/useProfile.js'

defineProps({ index: { type: String, default: '' } })
const { data, t, range, num } = useProfile()

const TYPES = ['work', 'teaching', 'leadership']
const groups = computed(() =>
  TYPES.map((type) => ({ type, items: (data.value.experience ?? []).filter((e) => e.type === type) })).filter((g) => g.items.length)
)
const activeType = ref(TYPES[0])
const activeGroup = computed(() => groups.value.find((g) => g.type === activeType.value) ?? groups.value[0])

const tabs = ref([])
function onTabKey(e, i) {
  const n = groups.value.length
  const rtl = document.documentElement.dir === 'rtl'
  const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, Home: -i, End: n - 1 - i }[e.key]
  if (step === undefined) return
  e.preventDefault()
  const next = (i + step + n) % n
  activeType.value = groups.value[next].type
  tabs.value[next]?.focus()
}
</script>

<template>
  <SectionShell id="experience" :index="index" :label="t('section.experience')" :title="t('section.experience.title')">
    <div role="tablist" :aria-label="t('section.experience')" class="mb-10 inline-flex rounded-lg border border-line bg-elev p-1">
      <button
        v-for="(g, i) in groups"
        :id="`tab-${g.type}`"
        :key="g.type"
        :ref="(el) => (tabs[i] = el)"
        type="button"
        role="tab"
        :aria-selected="activeGroup.type === g.type"
        :aria-controls="`panel-${g.type}`"
        :tabindex="activeGroup.type === g.type ? 0 : -1"
        class="relative rounded-md px-4 py-1.5 text-sm transition-colors duration-200"
        :class="activeGroup.type === g.type ? 'bg-bg text-fg shadow-sm ring-1 ring-line' : 'text-muted hover:text-fg'"
        @click="activeType = g.type"
        @keydown="onTabKey($event, i)"
      >
        {{ t(`exp.${g.type}`) }}
        <span class="ms-1.5 font-mono text-[0.68rem] text-subtle">{{ num(g.items.length) }}</span>
      </button>
    </div>

    <Transition mode="out-in" enter-active-class="transition duration-300 ease-out-expo" enter-from-class="opacity-0 translate-y-1" leave-active-class="transition duration-100" leave-to-class="opacity-0">
      <ol
        :id="`panel-${activeGroup.type}`"
        :key="activeGroup.type"
        role="tabpanel"
        :aria-labelledby="`tab-${activeGroup.type}`"
        class="relative space-y-0 border-s border-line"
      >
        <li v-for="item in activeGroup.items" :key="item.id" class="group relative ps-8 pb-10 last:pb-0">
          <span class="absolute -start-[5px] top-2 size-[9px] rounded-full border border-line-strong bg-bg transition-colors duration-300 group-hover:border-accent group-hover:bg-accent" aria-hidden="true" />
          <div class="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <h3 class="text-lg font-medium tracking-tight">{{ item.role }}</h3>
            <p class="shrink-0 font-mono text-xs text-subtle tabular-nums">{{ range(item.start, item.end) }}</p>
          </div>
          <p class="mt-1 text-sm text-muted">
            {{ item.organization }}<template v-if="item.location"> · {{ item.location }}</template>
          </p>
          <ul v-if="item.bullets?.length" class="mt-4 space-y-2 text-[0.95rem] leading-relaxed text-muted">
            <li v-for="(b, i) in item.bullets" :key="i" class="flex gap-3">
              <span class="mt-[0.7em] h-px w-3 shrink-0 bg-line-strong" aria-hidden="true" />
              <span>{{ b }}</span>
            </li>
          </ul>
          <ul v-if="item.courses?.length" class="mt-4 divide-y divide-line rounded-lg border border-line">
            <li v-for="c in item.courses" :key="c.name" class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5 px-4 py-2.5 text-sm">
              <span>
                <span class="text-fg">{{ c.name }}</span>
                <span v-if="c.instructor" class="text-subtle"> · {{ c.instructor }}</span>
              </span>
              <span class="font-mono text-xs text-subtle">{{ c.term }}</span>
            </li>
          </ul>
          <ul v-if="item.tags?.length" class="mt-4 flex flex-wrap gap-1.5">
            <li v-for="tag in item.tags" :key="tag" class="chip">{{ tag }}</li>
          </ul>
        </li>
      </ol>
    </Transition>

    <div v-if="data.education?.length" class="mt-20">
      <h3 class="eyebrow mb-6">{{ t('section.education') }}</h3>
      <div class="grid gap-4 md:grid-cols-2">
        <article v-for="(ed, i) in data.education" :key="ed.id" v-reveal="i * 80" class="card card-interactive flex flex-col p-6">
          <p class="font-mono text-xs text-subtle tabular-nums">{{ range(ed.start, ed.end) }}</p>
          <h4 class="mt-3 text-base font-medium leading-snug">{{ ed.degree }}</h4>
          <p class="mt-1 text-sm text-muted">{{ ed.institution }}</p>
          <p v-if="ed.gpa" class="mt-auto flex items-baseline gap-2 border-t border-line pt-4 text-sm">
            <span class="text-subtle">{{ t('gpa') }}</span>
            <span class="text-xl font-semibold tabular-nums" dir="ltr">{{ num(ed.gpa.value) }}</span>
            <span class="text-subtle" dir="ltr">/ {{ num(ed.gpa.scale) }}</span>
          </p>
        </article>
      </div>
    </div>
  </SectionShell>
</template>
