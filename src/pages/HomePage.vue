<script setup>
import { computed } from 'vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import SkillsSection from '@/components/sections/SkillsSection.vue'
import ExperienceSection from '@/components/sections/ExperienceSection.vue'
import ResearchSection from '@/components/sections/ResearchSection.vue'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import AchievementsSection from '@/components/sections/AchievementsSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import { useProfile } from '@/composables/useProfile.js'
import { useSeo } from '@/composables/useSeo.js'

const { data } = useProfile()
useSeo()

const REGISTRY = {
  about: { component: AboutSection, show: (d) => d.personal?.about?.length },
  skills: { component: SkillsSection, show: (d) => d.skills?.length },
  experience: { component: ExperienceSection, show: (d) => d.experience?.length || d.education?.length },
  // Research & Writing: publications + their write-ups + standalone articles.
  research: { component: ResearchSection, show: (d) => d.publications?.length || d.articles?.length },
  projects: { component: ProjectsSection, show: (d) => d.projects?.length },
  achievements: { component: AchievementsSection, show: (d) => d.achievements?.length },
  contact: { component: ContactSection, show: (d) => d.contact?.email }
}
const DEFAULT_ORDER = ['about', 'research', 'experience', 'projects', 'skills', 'achievements', 'contact']

/** Section order/visibility comes from profile.meta.sections. */
const sections = computed(() =>
  (data.value.meta?.sections ?? DEFAULT_ORDER)
    .filter((key) => REGISTRY[key]?.show(data.value))
    .map((key) => ({ key, component: REGISTRY[key].component }))
)
</script>

<template>
  <HeroSection />
  <component :is="s.component" v-for="s in sections" :key="s.key" />
</template>
