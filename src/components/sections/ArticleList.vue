<script setup>
/** Shared list of articles (home section + /articles index). */
import AppIcon from '../ui/AppIcon.vue'
import SmartLink from '../ui/SmartLink.vue'
import { useProfile } from '@/composables/useProfile.js'
import { readingTime } from '@/lib/content.js'

defineProps({ articles: { type: Array, required: true } })
const { t, date, data } = useProfile()
/** Articles can reference a publication by id instead of being listed twice. */
const pub = (a) => a.publication && data.value.publications?.find((p) => p.id === a.publication)
const href = (a) => (a.type === 'external' ? a.url : `/articles/${a.slug}`)
</script>

<template>
  <ul class="divide-y divide-line border-y border-line">
    <li v-for="(a, i) in articles" :key="a.id" v-reveal="i * 60">
      <SmartLink
        :to="href(a)"
        class="group -mx-3 grid gap-x-8 gap-y-2 rounded-lg px-3 py-6 transition-colors hover:bg-elev sm:grid-cols-[140px_minmax(0,1fr)_auto]"
      >
        <span class="font-mono text-xs text-subtle tabular-nums sm:pt-1">
          <time :datetime="a.date">{{ date(a.date, 'long') }}</time>
        </span>
        <span class="min-w-0">
          <span class="heading-serif block text-xl leading-snug text-balance group-hover:text-accent transition-colors">{{ a.title }}</span>
          <span v-if="a.excerpt" class="mt-2 line-clamp-2 block text-[0.94rem] leading-relaxed text-muted">{{ a.excerpt }}</span>
          <span class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-subtle">
            <span v-if="a.type === 'external'" class="chip">{{ a.publisher || t('article.external') }}</span>
            <span v-else>{{ t('article.minRead', { n: readingTime(a.content) }) }}</span>
            <span v-if="pub(a)" class="chip">{{ t('article.basedOn') }} · <span dir="ltr">{{ pub(a).shortVenue || pub(a).year }}</span></span>
            <span v-for="tag in a.tags" :key="tag" class="font-mono">#{{ tag }}</span>
          </span>
        </span>
        <span class="hidden self-center sm:block">
          <AppIcon :name="a.type === 'external' ? 'arrow-up-right' : 'arrow-right'" :size="18" :class="a.type === 'external' ? 'arrow arrow-diag' : 'arrow'" class="text-subtle group-hover:text-fg" />
        </span>
      </SmartLink>
    </li>
  </ul>
</template>
