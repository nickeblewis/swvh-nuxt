<script setup lang="ts">
import type { Occurrence } from '#shared/types/content'

/**
 * The "Today · 7:30 PM" lozenge for an activity's next session.
 * `overlay` sits on an image (activity cards); otherwise it's inline on a plain background.
 */
defineProps<{ occurrence: Occurrence, overlay?: boolean }>()
</script>

<template>
  <span
    v-if="overlay"
    class="absolute bottom-2 left-3 rounded-full px-3 py-1 text-xs font-bold"
    :class="occurrence.highlight ? 'bg-amber-400 text-stone-950' : 'bg-white/90 text-stone-900'"
  >
    {{ occurrence.label }}
  </span>
  <p v-else class="mt-5">
    <span
      class="inline-flex rounded-full px-4 py-1.5 text-sm font-bold"
      :class="occurrence.highlight ? 'bg-amber-400 text-stone-950' : 'bg-teal-700 text-white dark:bg-teal-300 dark:text-teal-950'"
    >
      <span class="sr-only">Next session: </span>{{ occurrence.label }}
    </span>
  </p>
</template>
