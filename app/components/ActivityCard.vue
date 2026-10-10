<script setup lang="ts">
import type { ActivityItem } from '#shared/types/content'

/**
 * A linked card for one activity. `compact` shows a shorter, dimmed image
 * (home and activities index). The next session, when there is one, shows as a
 * "Today · 7:30 PM" badge on the image.
 */
defineProps<{ activity: ActivityItem, compact?: boolean }>()

const site = useSite()
</script>

<template>
  <NuxtLink
    :to="`/regular-activities/${activity.slug}`"
    class="group block overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-1 hover:border-teal-500 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900"
  >
    <div
      class="relative overflow-hidden bg-teal-700/10 dark:bg-teal-300/10"
      :class="compact ? 'aspect-[9/2]' : 'aspect-[3/2]'"
    >
      <img
        v-if="activity.heroImagePath"
        :src="activity.heroImagePath"
        :alt="activity.heroImageAlt || activity.title"
        loading="lazy"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      >
      <span
        v-else
        class="absolute inset-0 grid place-items-center text-2xl font-black text-teal-700/40 dark:text-teal-300/40"
      >{{ site.shortName }}</span>
      <div
        v-if="compact && activity.heroImagePath"
        class="absolute inset-0 bg-stone-950/50 transition-colors duration-300 group-hover:bg-stone-950/30"
      />
      <OccurrenceBadge v-if="activity.occurrence" :occurrence="activity.occurrence" overlay />
    </div>
    <div class="flex items-start justify-between gap-4 px-5 pt-5">
      <h3 class="leading-tight font-black group-hover:text-teal-700 dark:group-hover:text-teal-300">
        {{ activity.title }}
      </h3>
      <span class="text-xl text-teal-700 dark:text-teal-300">→</span>
    </div>
    <div class="mt-4 space-y-1 px-5 pb-5 text-sm text-stone-600 dark:text-stone-400">
      <p v-if="activity.day">
        📅 {{ activity.day }}
      </p>
      <p v-if="activity.time">
        ⏰ {{ activity.time }}
      </p>
      <p v-if="activity.price">
        £ {{ activity.price }}
      </p>
    </div>
  </NuxtLink>
</template>
