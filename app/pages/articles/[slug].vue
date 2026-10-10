<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data: article } = await useFetch(() => `/api/articles/${slug.value}`)

if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
}

useSeoMeta({
  title: () => article.value?.title,
  description: () => article.value?.description,
  ogTitle: () => article.value?.title,
  ogDescription: () => article.value?.description,
  ogImage: () => article.value?.heroImageUrl ?? undefined,
})
</script>

<template>
  <article v-if="article" class="mx-auto w-full max-w-4xl">
    <header class="border-b border-stone-200 pb-8 dark:border-stone-800">
      <NuxtLink to="/articles" class="text-sm font-bold text-teal-700 dark:text-teal-300">
        ← All articles
      </NuxtLink>
      <h1 class="mt-6 text-5xl font-black tracking-tight sm:text-6xl">
        {{ article.title }}
      </h1>
      <p class="mt-5 max-w-2xl text-xl leading-8 text-stone-600 dark:text-stone-300">
        {{ article.description }}
      </p>
      <div class="mt-5 flex flex-wrap gap-3 text-sm text-stone-500 dark:text-stone-400">
        <span v-if="article.publishedAt">Published {{ formatLongDate(article.publishedAt) }}</span>
        <span>{{ pluralize(article.readingTimeMinutes, 'minute') }} read</span>
      </div>
      <img
        v-if="article.heroImageUrl"
        :src="article.heroImageUrl"
        :alt="article.heroImageAlt || article.title"
        class="mt-8 aspect-[16/7] w-full rounded-3xl object-cover"
      >
    </header>

    <ContentBody :doc="article.doc" />
  </article>
</template>
