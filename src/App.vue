<script setup>
import { useRoute } from 'vue-router'
import SiteHeader from './components/layout/SiteHeader.vue'
import SiteFooter from './components/layout/SiteFooter.vue'
import { useProfile } from './composables/useProfile.js'

const route = useRoute()
const { t } = useProfile()
</script>

<template>
  <a href="#main" class="sr-only z-[100] rounded-md bg-fg px-4 py-2 text-bg focus:not-sr-only focus:fixed focus:start-4 focus:top-4">{{ t('skip') }}</a>
  <SiteHeader />
  <RouterView v-slot="{ Component }">
    <Transition name="page-fade" mode="out-in">
      <main id="main" :key="route.path" tabindex="-1" class="outline-none">
        <component :is="Component" />
      </main>
    </Transition>
  </RouterView>
  <SiteFooter />
</template>
