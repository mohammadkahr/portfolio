<script setup>
/** Renders RouterLink for internal paths (locale-aware) and <a> for external URLs. */
import { computed } from 'vue'
import { useLocale } from '@/composables/useLocale.js'

const props = defineProps({ to: { type: String, required: true } })
const { path } = useLocale()
const external = computed(() => /^(https?:|mailto:|tel:)/.test(props.to) || /\.pdf$/i.test(props.to))
const isHttp = computed(() => /^https?:/.test(props.to))
</script>

<template>
  <a v-if="external" :href="to" :target="isHttp ? '_blank' : undefined" :rel="isHttp ? 'noopener noreferrer' : undefined"><slot /></a>
  <RouterLink v-else :to="path(to)"><slot /></RouterLink>
</template>
