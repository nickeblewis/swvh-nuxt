<script setup lang="ts">
import type { SpaceItem } from '#shared/types/content'

/**
 * A space's name as a chip; its full details show as a tooltip card on hover,
 * focus or tap. CSS only. Renders an `<li>`, so use it inside a list.
 */
const props = defineProps<{ space: SpaceItem }>()

const summary = computed(() =>
  [
    props.space.capacity ? `Up to ${pluralize(props.space.capacity, 'person', 'people')}` : null,
    props.space.dimensions || null,
  ].filter(Boolean).join(' · '),
)
</script>

<template>
  <li class="group relative">
    <button
      type="button"
      :aria-describedby="`space-${space.slug}-details`"
      class="rounded-full border border-amber-800/30 bg-white px-4 py-2 text-sm font-bold text-stone-900 transition hover:border-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 dark:border-amber-300/40 dark:bg-stone-950 dark:text-white dark:hover:border-amber-300"
    >
      {{ space.name }}
    </button>
    <div
      :id="`space-${space.slug}-details`"
      role="tooltip"
      class="pointer-events-none invisible absolute bottom-full left-0 z-20 mb-3 w-80 max-w-[calc(100vw-4rem)] translate-y-1 opacity-0 transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
    >
      <article class="rounded-2xl border border-amber-200 bg-white p-5 shadow-xl dark:border-stone-800 dark:bg-stone-950">
        <h3 class="text-lg font-black">
          {{ space.name }}
        </h3>
        <p v-if="summary" class="mt-1 text-sm font-semibold text-amber-800 dark:text-amber-300">
          {{ summary }}
        </p>
        <p v-if="space.description" class="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
          {{ space.description }}
        </p>
      </article>
    </div>
  </li>
</template>
