<script setup lang="ts">
import type { Occurrence } from '#shared/types/content'

/** The eyebrow, title, intro and image at the top of a built-in page. */
withDefaults(defineProps<{
  title: string
  /** Defaults to the site name. */
  eyebrow?: string
  intro?: string | null
  image?: string | null
  /** Defaults to the title. */
  imageAlt?: string | null
  /** A Tailwind object-position class to control the crop, e.g. "object-[center_80%]". */
  imagePosition?: string
  /** Shown as a "Today · 7:30 PM" badge under the title. */
  occurrence?: Occurrence | null
}>(), {
  imagePosition: 'object-center',
})

const site = useSite()
</script>

<template>
  <header class="border-b border-stone-200 pb-8 dark:border-stone-800">
    <p class="text-sm font-bold tracking-[0.2em] text-teal-700 uppercase dark:text-teal-300">
      {{ eyebrow ?? site.name }}
    </p>
    <h1 class="mt-3 text-5xl font-black tracking-tight sm:text-6xl">
      {{ title }}
    </h1>
    <OccurrenceBadge v-if="occurrence" :occurrence="occurrence" />
    <p v-if="intro" class="mt-5 max-w-2xl text-xl leading-8 text-stone-600 dark:text-stone-300">
      {{ intro }}
    </p>
    <img
      v-if="image"
      :src="image"
      :alt="imageAlt || title"
      class="mt-8 aspect-[16/7] w-full rounded-3xl object-cover"
      :class="imagePosition"
    >
  </header>
</template>
