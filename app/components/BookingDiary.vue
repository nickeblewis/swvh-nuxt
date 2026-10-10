<script setup lang="ts">
// Hall Master weekly diary. Temporary until bookings are handled in-app.
const site = useSite()
</script>

<template>
  <div class="overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-800">
    <iframe
      :src="`https://v2.hallmaster.co.uk/Diary/ViewWeeklyDiary/${site.hallmasterDiaryId}`"
      :title="`${site.name} booking diary`"
      width="100%"
      height="860"
      loading="lazy"
      class="block w-full bg-white"
    />
  </div>
</template>
