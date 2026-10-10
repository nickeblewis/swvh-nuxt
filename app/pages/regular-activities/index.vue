<script setup lang="ts">
const { data } = await useFetch('/api/activities')

useSeoMeta({
  title: 'Regular Activities',
  description: 'The hall hosts a range of regular activities for all ages. Whether it is keeping fit or learning a new skill, there is something for everyone.',
})
</script>

<template>
  <header class="mx-auto w-full max-w-3xl text-center">
    <p class="text-sm font-bold tracking-[0.2em] text-teal-700 uppercase dark:text-teal-300">
      Village life
    </p>
    <h1 class="mt-3 text-5xl font-black tracking-tight sm:text-6xl">
      Regular activities
    </h1>
    <p class="mt-5 text-lg leading-8 text-stone-600 dark:text-stone-300">
      The hall hosts a range of regular activities for all ages. Whether it is keeping fit or learning a new skill, there is something for everyone.
    </p>
    <p v-if="data" class="mt-4 font-semibold text-teal-700 dark:text-teal-300">
      Today is {{ data.today }} · soonest first
    </p>
  </header>

  <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <ActivityCard v-for="activity in data?.activities ?? []" :key="activity.slug" :activity="activity" compact />
  </section>
</template>
