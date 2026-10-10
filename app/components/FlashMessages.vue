<script setup lang="ts">
// Notice and alert banners; see useFlash().
const { notice, alert } = useFlash()
</script>

<template>
  <div v-if="notice || alert" class="grid gap-3">
    <p
      v-if="notice"
      role="status"
      class="rounded-md bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800 dark:bg-teal-950 dark:text-teal-200"
    >
      {{ notice }}
    </p>
    <p
      v-if="alert"
      role="alert"
      class="rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:bg-red-950 dark:text-red-200"
    >
      {{ alert }}
    </p>
  </div>
</template>
