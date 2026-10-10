<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data } = await useFetch(() => `/api/activities/${slug.value}`)

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Activity not found', fatal: true })
}

const activity = computed(() => data.value!.activity)

const pills = computed(() => [
  { icon: '📅', value: activity.value.day },
  { icon: '⏰', value: activity.value.time },
  { icon: '💷', value: activity.value.price },
].filter(pill => pill.value))

const details = computed(() => [
  { label: 'Age range', value: activity.value.ageRange },
  { label: 'Contact', value: activity.value.contact },
].filter(detail => detail.value))

useSeoMeta({
  title: () => activity.value.title,
  description: () => activity.value.description
    ?? [activity.value.day, activity.value.time].filter(Boolean).join(', '),
  ogTitle: () => activity.value.title,
  ogImage: () => activity.value.heroImagePath ?? undefined,
})
</script>

<template>
  <article class="mx-auto w-full max-w-4xl">
    <header class="border-b border-stone-200 pb-8 dark:border-stone-800">
      <NuxtLink to="/regular-activities" class="text-sm font-bold text-teal-700 dark:text-teal-300">
        ← All regular activities
      </NuxtLink>
      <h1 class="mt-6 text-5xl font-black tracking-tight sm:text-6xl">
        {{ activity.title }}
      </h1>
      <img
        v-if="activity.heroImagePath"
        :src="activity.heroImagePath"
        :alt="activity.heroImageAlt || activity.title"
        class="mt-8 aspect-[16/7] w-full rounded-3xl object-cover"
      >
      <div class="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-stone-700 dark:text-stone-300">
        <span
          v-for="pill in pills"
          :key="pill.icon"
          class="rounded-full bg-stone-100 px-4 py-2 dark:bg-stone-900"
        >{{ pill.icon }} {{ pill.value }}</span>
      </div>
    </header>

    <ContentBody :body="activity.body" />

    <dl class="mt-10 grid gap-4 border-t border-stone-200 pt-6 text-sm sm:grid-cols-2 dark:border-stone-800">
      <div v-for="detail in details" :key="detail.label">
        <dt class="font-bold tracking-wider text-stone-500 uppercase">
          {{ detail.label }}
        </dt>
        <dd class="mt-1">
          {{ detail.value }}
        </dd>
      </div>
      <div v-if="activity.phone">
        <dt class="font-bold tracking-wider text-stone-500 uppercase">
          Phone
        </dt>
        <dd class="mt-1">
          <a
            :href="`tel:${activity.phone.replace(/[^\d+]/g, '')}`"
            class="font-semibold text-teal-700 hover:underline dark:text-teal-300"
          >{{ activity.phone }}</a>
        </dd>
      </div>
    </dl>

    <a
      v-if="activity.externalUrl"
      :href="activity.externalUrl"
      target="_blank"
      rel="noopener"
      class="mt-8 inline-flex rounded-full bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
    >More information</a>
  </article>

  <section class="border-t border-stone-200 pt-10 dark:border-stone-800">
    <h2 class="text-2xl font-black">
      More from the hall
    </h2>
    <div class="mt-5 grid gap-4 sm:grid-cols-3">
      <ActivityCard v-for="related in data?.related ?? []" :key="related.slug" :activity="related" />
    </div>
  </section>
</template>
