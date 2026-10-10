<script setup lang="ts">
/** An image, title and summary linking to another page. Used on About. */
defineProps<{ to: string, title: string, image: string, summary: string }>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900"
  >
    <img :src="image" :alt="title" class="h-48 w-full object-cover">
    <div class="p-6">
      <h2 class="text-xl font-black group-hover:text-teal-700 dark:group-hover:text-teal-300">
        {{ title }}
      </h2>
      <p class="mt-3 leading-7 text-stone-600 dark:text-stone-300">
        {{ summary }}
      </p>
      <p class="mt-4 text-sm font-bold text-teal-700 dark:text-teal-300">
        Read more →
      </p>
    </div>
  </NuxtLink>
</template>
