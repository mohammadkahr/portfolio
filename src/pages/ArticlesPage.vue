<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ArticleList from '@/components/sections/ArticleList.vue'
import { useProfile } from '@/composables/useProfile.js'
import { useLocale } from '@/composables/useLocale.js'
import { useSeo } from '@/composables/useSeo.js'

const { data, t } = useProfile()
const { path } = useLocale()
useSeo({ title: computed(() => t('section.articles.title').replace(/\.$/, '')) })
</script>

<template>
  <div class="container-page py-16 sm:py-24">
    <RouterLink :to="path('/')" class="group inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
      <AppIcon name="arrow-left" :size="14" class="arrow" />
      {{ t('article.home') }}
    </RouterLink>
    <p class="eyebrow mt-12">{{ t('section.articles') }}</p>
    <h1 class="heading-serif mt-3 mb-14 text-4xl sm:text-5xl">{{ t('section.articles.title') }}</h1>
    <ArticleList :articles="data.articles" />
  </div>
</template>
