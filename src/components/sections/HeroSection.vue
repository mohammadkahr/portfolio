<script setup>
import { computed } from 'vue'
import AppIcon from '../ui/AppIcon.vue'
import SmartLink from '../ui/SmartLink.vue'
import { useProfile } from '@/composables/useProfile.js'
import { useLocale } from '@/composables/useLocale.js'

const { data, t, num, resumeUrl } = useProfile()
const { otherLocales, localeName } = useLocale()
const p = computed(() => data.value.personal)

/** Featured paper: the first publication, plus its write-up if one exists. */
const paper = computed(() => data.value.publications?.[0])
const writeUp = computed(() => paper.value && data.value.articles?.find((a) => a.publication === paper.value.id))
const paperPdf = computed(() => paper.value?.pdf)
</script>

<template>
  <section class="relative" aria-labelledby="hero-title">
    <div class="container-page pt-16 pb-20 sm:pt-24 sm:pb-24">
      <div class="grid items-start gap-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <div v-if="p.avatar" v-reveal class="mb-7 size-24 overflow-hidden rounded-2xl border border-line bg-elev shadow-sm sm:size-28">
            <img :src="p.avatar" :alt="p.name" class="size-full object-cover" width="112" height="112" fetchpriority="high" />
          </div>

          <p v-if="p.availability?.enabled" v-reveal class="mb-9 inline-flex items-center gap-2.5 text-[0.82rem] text-muted">
            <span class="pulse-dot relative size-1.5 rounded-full bg-emerald-500 text-emerald-500" aria-hidden="true" />
            {{ p.availability.text }}
          </p>

          <h1 id="hero-title" v-reveal="60" class="heading-serif text-[clamp(2.8rem,7.2vw,5.4rem)] leading-[1] tracking-[-0.03em] text-balance">
            {{ p.name }}
          </h1>

          <p v-reveal="120" class="mt-6 text-lg sm:text-xl">
            <span class="font-medium text-accent">{{ p.role }}</span>
            <span class="text-subtle"> · </span>
            <span class="text-muted">{{ p.headline }}</span>
          </p>

          <p v-reveal="180" class="mt-6 max-w-xl text-[1.06rem] leading-relaxed text-pretty text-muted">
            {{ p.tagline }}
          </p>

          <div v-reveal="240" class="mt-10 flex flex-wrap items-center gap-3">
            <a :href="resumeUrl()" class="btn btn-primary" download>
              <AppIcon name="download" :size="15" />
              {{ t('hero.resume') }}
            </a>
            <a href="#contact" class="btn btn-ghost group">
              {{ t('hero.contact') }}
              <AppIcon name="arrow-right" :size="15" class="arrow" />
            </a>
            <a
              v-for="l in otherLocales"
              :key="l"
              :href="resumeUrl(l)"
              :hreflang="l"
              class="link-underline ms-1 text-sm text-subtle hover:text-fg"
              download
            >
              {{ t('hero.resumeAlt') }} · {{ localeName(l) }}
            </a>
          </div>

          <ul v-reveal="300" class="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm" aria-label="Profiles">
            <li v-for="s in data.social" :key="s.id">
              <a :href="s.url" target="_blank" rel="noopener noreferrer me" class="group inline-flex items-center gap-2 text-muted hover:text-fg">
                <AppIcon :name="s.icon" :size="15" />
                <span class="link-underline">{{ s.label }}</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Featured research: what a hiring manager for an AI/research role looks for first -->
        <aside v-if="paper" v-reveal="200" class="lg:pt-3" :aria-label="t('hero.featured')">
          <div class="card overflow-hidden">
            <div class="p-6 sm:p-7">
              <p class="eyebrow flex items-center justify-between gap-3">
                <span>{{ t('hero.featured') }}</span>
                <span class="font-mono text-[0.7rem] tracking-normal text-accent normal-case" dir="ltr">{{ paper.shortVenue || num(paper.year) }}</span>
              </p>
              <h2 class="heading-serif mt-4 text-[1.35rem] leading-snug text-balance" dir="ltr" :class="$route.meta.locale === 'fa' && 'text-end'">
                {{ paper.shortTitle || paper.title }}
              </h2>
              <p class="mt-3 text-sm leading-relaxed text-muted">{{ paper.summary }}</p>
            </div>
            <dl v-if="paper.metrics?.length" class="grid grid-cols-3 divide-x divide-line border-t border-line">
              <div v-for="m in paper.metrics" :key="m.value" class="px-4 py-4 sm:px-5">
                <dd class="text-lg font-semibold tracking-tight tabular-nums">{{ num(m.value) }}</dd>
                <dt class="mt-0.5 text-[0.72rem] leading-snug text-subtle">{{ m.label }}</dt>
              </div>
            </dl>
            <div class="flex flex-wrap gap-x-5 gap-y-2 border-t border-line px-6 py-4 text-sm sm:px-7">
              <SmartLink v-if="writeUp" :to="`/articles/${writeUp.slug}`" class="group inline-flex items-center gap-1.5 text-fg">
                <span class="link-underline">{{ t('research.writeUp') }}</span>
                <AppIcon name="arrow-right" :size="14" class="arrow" />
              </SmartLink>
              <a v-if="paperPdf" :href="paperPdf" download class="inline-flex items-center gap-1.5 text-muted hover:text-fg">
                <AppIcon name="download" :size="14" />
                <span class="link-underline">{{ t('research.pdf') }}</span>
              </a>
            </div>
          </div>

          <div v-if="p.focus?.length" class="mt-8">
            <h2 class="eyebrow mb-3">{{ t('focus') }}</h2>
            <ul class="flex flex-wrap gap-2">
              <li v-for="f in p.focus" :key="f" class="rounded-full border border-line px-3 py-1 text-[0.82rem] text-muted">{{ f }}</li>
            </ul>
          </div>
        </aside>
      </div>

      <dl v-if="p.highlights?.length" class="mt-20 grid grid-cols-2 border-y border-line lg:grid-cols-4">
        <div
          v-for="(h, i) in p.highlights"
          :key="i"
          v-reveal="i * 70"
          class="flex flex-col gap-1.5 border-line px-1 py-6 sm:px-5 [&:nth-child(odd)]:border-e lg:border-e lg:last:border-e-0"
          :class="{ 'border-t lg:border-t-0': i > 1 }"
        >
          <dt class="order-2 text-[0.8rem] leading-snug text-muted">{{ h.label }}</dt>
          <dd class="heading-serif order-1 text-[2rem] leading-none tabular-nums">{{ h.value }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>
