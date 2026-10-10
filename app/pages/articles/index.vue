<script setup lang="ts">
const { data: articles } = await useFetch('/api/articles')

useSeoMeta({ title: 'Articles', description: 'News from Spencers Wood Village Hall.' })
</script>

<template>
  <section>
    <PageHeader title="Articles" eyebrow="News from the hall" />

    <div v-if="articles?.length" class="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      <ArticleCard v-for="article in articles" :key="article.slug" :article="article" />
    </div>
    <p v-else class="mt-10 text-lg text-stone-600 dark:text-stone-300">
      No articles yet — check back soon.
    </p>
  </section>
</template>
