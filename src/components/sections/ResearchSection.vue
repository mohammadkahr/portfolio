<script setup>
/**
 * Research & Writing: peer-reviewed publications first, each with its
 * plain-language write-up attached (articles with `publication: <id>`),
 * followed by any standalone articles.
 */
import { computed, ref } from 'vue'
import AppIcon from '../ui/AppIcon.vue'
import SectionShell from '../ui/SectionShell.vue'
import SmartLink from '../ui/SmartLink.vue'
import ArticleList from './ArticleList.vue'
import { useProfile } from '@/composables/useProfile.js'
import { useLocale } from '@/composables/useLocale.js'
import { readingTime, localizeDeep, getLocaleConfig } from '@/lib/content.js'
import profile from '~profile'

defineProps({ index: { type: String, default: '' } })
const { data, t, num } = useProfile()
const { path } = useLocale()

const writeUpFor = (pub) => data.value.articles?.find((a) => a.publication === pub.id)
const standalone = computed(() => (data.value.articles ?? []).filter((a) => !a.publication))
const externalLinks = (pub) => (pub.links ?? []).filter((l) => !(writeUpFor(pub) && l.url === `/articles/${writeUpFor(pub).slug}`))
const selfNames = [profile.personal?.name?.en ?? profile.personal?.name, data.value.personal.name].filter(Boolean)
const isSelf = (name) => selfNames.some((n) => n.replace(/\s/g, '') === name.replace(/\s/g, ''))

/** BibTeX generated from the publication fields (always in English). */
function bibtex(localized) {
  const cfg = getLocaleConfig(profile)
  const pub = localizeDeep(profile.publications.find((p) => p.id === localized.id), 'en', { ...cfg, fallback: 'en' })
  const key = `${(pub.authors?.[0] ?? 'author').split(' ').at(-1).toLowerCase()}${pub.year ?? ''}${pub.id.split('-')[0]}`
  const isDataset = pub.type === 'dataset'
  const fields = [
    ['title', `{${pub.title}}`],
    ['author', pub.authors?.join(' and ')],
    isDataset ? ['howpublished', `Kaggle, \\url{${pub.url}}`] : ['booktitle', pub.bibtexVenue ?? String(pub.venue).split(' — ')[0]],
    ['year', pub.year],
    isDataset ? ['note', 'Dataset, CC BY-SA 4.0'] : ['publisher', 'IEEE'],
    pub.doi ? ['doi', pub.doi] : null
  ].filter((f) => f && f[1])
  return `@${isDataset ? 'misc' : 'inproceedings'}{${key},\n${fields.map(([k, v]) => `  ${k} = {${v}}`).join(',\n')}\n}`
}
const copiedId = ref('')
async function copyCite(pub) {
  try {
    await navigator.clipboard.writeText(bibtex(pub))
    copiedId.value = pub.id
    setTimeout(() => (copiedId.value = ''), 1800)
  } catch {}
}
</script>

<template>
  <SectionShell id="research" :index="index" :label="t('section.research')" :title="t('section.research.title')">
    <div class="space-y-6">
      <article v-for="pub in data.publications" :key="pub.id" v-reveal class="card overflow-hidden">
        <div class="p-6 sm:p-8">
          <p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-subtle">
            <span class="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-accent">{{ t(`research.type.${pub.type || 'paper'}`) }}</span>
            <template v-if="pub.year">
              <span class="font-mono">{{ num(pub.year) }}</span>
              <span class="h-3 w-px bg-line-strong" aria-hidden="true" />
            </template>
            <span>{{ pub.venue }}</span>
          </p>
          <h3 class="heading-serif mt-4 text-[1.5rem] leading-snug text-balance sm:text-[1.75rem]" dir="ltr" :class="$route.meta.locale === 'fa' && 'text-end'">
            {{ pub.title }}
          </h3>
          <p class="mt-3 text-sm text-muted" dir="ltr" :class="$route.meta.locale === 'fa' && 'text-end'">
            <template v-for="(a, i) in pub.authors" :key="a">
              <span :class="isSelf(a) ? 'font-medium text-fg' : ''">{{ a }}</span><span v-if="i < pub.authors.length - 1">, </span>
            </template>
          </p>
          <p v-if="pub.role" class="mt-1 text-sm text-subtle">{{ t('research.role') }}: {{ pub.role }}</p>
          <p v-if="pub.summary" class="mt-5 max-w-3xl leading-relaxed text-pretty text-muted">{{ pub.summary }}</p>
          <ul v-if="pub.tags?.length" class="mt-6 flex flex-wrap gap-1.5">
            <li v-for="tag in pub.tags" :key="tag" class="chip">{{ tag }}</li>
          </ul>
        </div>

        <dl v-if="pub.metrics?.length" class="grid grid-cols-1 divide-y divide-line border-t border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div v-for="m in pub.metrics" :key="m.value" class="px-6 py-5 sm:px-8">
            <dd class="heading-serif text-[1.75rem] leading-none tabular-nums">{{ num(m.value) }}</dd>
            <dt class="mt-2 text-xs text-muted">{{ m.label }}</dt>
          </div>
        </dl>

        <!-- Attached write-up (the "writing" side of the same work) -->
        <RouterLink
          v-if="writeUpFor(pub)"
          :to="path(`/articles/${writeUpFor(pub).slug}`)"
          class="group flex items-center gap-4 border-t border-line px-6 py-5 transition-colors hover:bg-bg sm:px-8"
        >
          <span class="grid size-9 shrink-0 place-items-center rounded-lg border border-line text-muted group-hover:text-accent">
            <AppIcon name="book" :size="16" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-xs text-subtle">{{ t('research.writeUpLabel') }} · {{ t('article.minRead', { n: readingTime(writeUpFor(pub).content) }) }}</span>
            <span class="mt-0.5 block truncate font-medium group-hover:text-accent transition-colors">{{ writeUpFor(pub).title }}</span>
          </span>
          <AppIcon name="arrow-right" :size="16" class="arrow shrink-0 text-subtle group-hover:text-fg" />
        </RouterLink>

        <div class="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line px-6 py-4 sm:px-8">
          <template v-for="l in externalLinks(pub)" :key="l.url">
            <a v-if="/\.pdf$/i.test(l.url)" :href="l.url" download class="group inline-flex items-center gap-1.5 text-sm text-fg">
              <AppIcon name="download" :size="14" />
              <span class="link-underline">{{ l.label }}</span>
            </a>
            <SmartLink v-else :to="l.url" class="group inline-flex items-center gap-1.5 text-sm text-fg">
              <span class="link-underline">{{ l.label }}</span>
              <AppIcon name="arrow-up-right" :size="14" class="arrow arrow-diag" />
            </SmartLink>
          </template>
          <button type="button" class="group inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg" @click="copyCite(pub)">
            <AppIcon :name="copiedId === pub.id ? 'check' : 'copy'" :size="14" :class="copiedId === pub.id && 'text-emerald-500'" />
            <span class="link-underline">{{ copiedId === pub.id ? t('contact.copied') : t('research.cite') }}</span>
          </button>
          <span class="sr-only" role="status" aria-live="polite">{{ copiedId === pub.id ? t('contact.copied') : '' }}</span>
        </div>
      </article>
    </div>

    <div v-if="standalone.length" class="mt-16">
      <div class="mb-2 flex items-baseline justify-between gap-4">
        <h3 class="eyebrow">{{ t('section.articles') }}</h3>
        <RouterLink :to="path('/articles')" class="group inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
          <span class="link-underline">{{ t('article.all') }}</span>
          <AppIcon name="arrow-right" :size="14" class="arrow" />
        </RouterLink>
      </div>
      <ArticleList :articles="standalone.slice(0, 4)" />
    </div>
  </SectionShell>
</template>
