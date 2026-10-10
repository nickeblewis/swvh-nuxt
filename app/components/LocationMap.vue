<script setup lang="ts">
// TODO: swap for a static map or OpenStreetMap embed if we want to avoid Google.
const site = useSite()

const src = `https://www.google.com/maps?${new URLSearchParams({ output: 'embed', q: site.mapQuery })}`
</script>

<template>
  <div class="overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-800">
    <iframe
      :title="`Map showing ${site.name}`"
      :src="src"
      width="100%"
      height="450"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      class="block w-full bg-white"
    />
  </div>
</template>
