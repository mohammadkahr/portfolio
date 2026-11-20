<script setup>
import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import { useProfile } from '@/composables/useProfile.js'
import { useLocale } from '@/composables/useLocale.js'
import { useSeo } from '@/composables/useSeo.js'

const { t, num } = useProfile()
const { path } = useLocale()
useSeo({ title: computed(() => t('notFound.title')) })
useHead({ meta: [{ name: 'robots', content: 'noindex' }] })
</script>

<template>
  <div class="container-page flex min-h-[60vh] flex-col items-start justify-center py-24">
    <p class="font-mono text-sm text-accent">{{ num(404) }}</p>
    <h1 class="heading-serif mt-4 text-4xl sm:text-5xl">{{ t('notFound.title') }}</h1>
    <p class="mt-4 max-w-md text-muted">{{ t('notFound.text') }}</p>
    <RouterLink :to="path('/')" class="btn btn-primary mt-10">{{ t('notFound.cta') }}</RouterLink>
  </div>
</template>
