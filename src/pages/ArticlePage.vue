<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import AppIcon from '@/components/ui/AppIcon.vue'
import NotFoundPage from './NotFoundPage.vue'
import profile from '~profile'
import { readingTime, joinMarkdown } from '@/lib/content.js'
import { useProfile } from '@/composables/useProfile.js'
import { useLocale } from '@/composables/useLocale.js'
import { useSeo, absoluteUrl } from '@/composables/useSeo.js'

const route = useRoute()
const { data, t, date, num } = useProfile()
const { locale, path } = useLocale()

const internal = computed(() => data.value.articles.filter((a) => a.type !== 'external'))
const article = computed(() => internal.value.find((a) => a.slug === route.params.slug))
const position = computed(() => internal.value.findIndex((a) => a.slug === route.params.slug))
const newer = computed(() => internal.value[position.value - 1])
const older = computed(() => internal.value[position.value + 1])

/** True when the raw profile has no body for this locale (fallback is shown). */
const isFallback = computed(() => {
  const raw = profile.articles?.find((a) => a.slug === route.params.slug)?.content
  return raw && typeof raw === 'object' && !Array.isArray(raw) && !raw[locale.value]
})

marked.use({ gfm: true, breaks: false })
const html = computed(() => (article.value ? marked.parse(joinMarkdown(article.value.content)) : ''))
const minutes = computed(() => readingTime(article.value?.content))

useSeo({
  title: computed(() => article.value?.title),
  description: computed(() => article.value?.excerpt),
  type: 'article',
  image: computed(() => article.value?.cover),
  jsonLd: computed(() =>
    article.value && {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.value.title,
      description: article.value.excerpt,
      datePublished: article.value.date,
      inLanguage: locale.value,
      keywords: article.value.tags?.join(', '),
      author: { '@type': 'Person', name: data.value.personal.name, url: absoluteUrl(path('/')) },
      mainEntityOfPage: absoluteUrl(route.path)
    }
  )
})
</script>

<template>
  <NotFoundPage v-if="!article" />
  <article v-else class="container-page py-16 sm:py-24">
    <div class="mx-auto max-w-[44rem]">
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-sm text-muted">
        <RouterLink :to="path('/articles')" class="group inline-flex items-center gap-1.5 hover:text-fg">
          <AppIcon name="arrow-left" :size="14" class="arrow" />
          {{ t('article.back') }}
        </RouterLink>
      </nav>

      <header class="mt-12 border-b border-line pb-10">
        <p class="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-subtle">
          <time :datetime="article.date">{{ date(article.date, 'long') }}</time>
          <span class="h-3 w-px bg-line-strong" aria-hidden="true" />
          <span>{{ t('article.minRead', { n: minutes }) }}</span>
        </p>
        <h1 class="heading-serif mt-5 text-[clamp(2rem,5vw,3.25rem)] leading-[1.1] text-balance">{{ article.title }}</h1>
        <p v-if="article.excerpt" class="mt-6 text-lg leading-relaxed text-pretty text-muted">{{ article.excerpt }}</p>
        <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a v-if="article.pdf" :href="article.pdf" download class="btn btn-primary h-9 px-3.5 text-[0.82rem]">
            <AppIcon name="download" :size="14" /> {{ t('research.pdf') }}
          </a>
          <ul v-if="article.tags?.length" class="flex flex-wrap gap-1.5">
            <li v-for="tag in article.tags" :key="tag" class="chip">#{{ tag }}</li>
          </ul>
        </div>
      </header>

      <p v-if="isFallback" class="mt-8 rounded-lg border border-line bg-elev px-4 py-3 text-sm text-muted">{{ t('article.fallback') }}</p>

      <div class="prose-article mt-10" v-html="html" />

      <footer class="mt-20 border-t border-line pt-8">
        <div class="flex items-center gap-4">
          <span class="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-fg font-mono text-xs font-bold text-bg">
            <img v-if="data.personal.avatar" :src="data.personal.avatar" :alt="data.personal.name" class="size-full object-cover" width="44" height="44" loading="lazy" />
            <span v-else>{{ data.personal.initials }}</span>
          </span>
          <div>
            <p class="text-sm font-medium">{{ data.personal.name }}</p>
            <p class="text-sm text-muted">{{ data.personal.role }}</p>
          </div>
        </div>
        <nav v-if="newer || older" class="mt-10 grid gap-4 sm:grid-cols-2" :aria-label="t('section.articles')">
          <RouterLink v-if="older" :to="path(`/articles/${older.slug}`)" class="card card-interactive group p-5">
            <span class="text-xs text-subtle">{{ t('article.prev') }}</span>
            <span class="mt-1 block font-medium">{{ older.title }}</span>
          </RouterLink>
          <RouterLink v-if="newer" :to="path(`/articles/${newer.slug}`)" class="card card-interactive group p-5 text-end sm:col-start-2">
            <span class="text-xs text-subtle">{{ t('article.next') }}</span>
            <span class="mt-1 block font-medium">{{ newer.title }}</span>
          </RouterLink>
        </nav>
      </footer>
    </div>
  </article>
</template>
