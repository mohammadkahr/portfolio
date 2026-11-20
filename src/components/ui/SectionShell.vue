<script setup>
/** Editorial section layout: sticky label rail + content column. */
defineProps({
  id: { type: String, required: true },
  index: { type: [String, Number], default: '' },
  label: { type: String, required: true },
  title: { type: String, default: '' }
})
</script>

<template>
  <section :id="id" :aria-labelledby="`${id}-title`" class="border-t border-line py-20 sm:py-28">
    <div class="container-page grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-16">
      <div class="lg:sticky lg:top-28 lg:self-start">
        <p class="eyebrow flex items-center gap-2.5">
          <span class="h-3.5 w-[3px] rounded-full bg-accent" aria-hidden="true" />
          <span>{{ label }}</span>
        </p>
      </div>
      <div class="min-w-0">
        <h2
          v-if="title"
          :id="`${id}-title`"
          v-reveal
          class="heading-serif mb-12 max-w-2xl text-[2rem] leading-[1.15] text-balance sm:text-[2.6rem]"
        >
          {{ title }}
        </h2>
        <h2 v-else :id="`${id}-title`" class="sr-only">{{ label }}</h2>
        <slot />
      </div>
    </div>
  </section>
</template>
