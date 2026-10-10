<script setup lang="ts">
/**
 * Renders a markdown body as prose. Database records (activities, pages) pass
 * raw markdown as `body` and render through `<MDC>`; articles pass a parsed
 * Nuxt Content document as `doc` and render through `<ContentRenderer>`. Both
 * go through the same pipeline, so the output matches.
 */
defineProps<{ body?: string | null, doc?: Record<string, unknown> | null }>()
</script>

<template>
  <div class="prose mt-10 max-w-none prose-stone dark:prose-invert">
    <ContentRenderer v-if="doc" :value="doc" />
    <MDC v-else-if="body" :value="body" />
  </div>
</template>
