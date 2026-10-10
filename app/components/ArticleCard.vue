<script setup lang="ts">
import type { ArticleItem } from '#shared/types/content'

defineProps<{ article: ArticleItem }>()
</script>

<template>
  <article
    class="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900"
  >
    <NuxtLink v-if="article.heroImageUrl" :to="`/articles/${article.slug}`" class="block overflow-hidden">
      <img
        :src="article.heroImageUrl"
        :alt="article.heroImageAlt || article.title"
        class="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
      >
    </NuxtLink>

    <div class="flex flex-col gap-4 p-6">
      <p
        v-if="article.publishedAt"
        class="text-xs font-semibold tracking-[0.14em] text-teal-700 uppercase dark:text-teal-300"
      >
        {{ formatLongDate(article.publishedAt) }}
      </p>
      <div>
        <h2 class="text-2xl font-black tracking-tight">
          <NuxtLink :to="`/articles/${article.slug}`" class="hover:text-teal-700 dark:hover:text-teal-300">
            {{ article.title }}
          </NuxtLink>
        </h2>
        <p class="mt-3 line-clamp-3 leading-7 text-stone-600 dark:text-stone-300">
          {{ article.description }}
        </p>
      </div>
      <div class="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
        <span>{{ pluralize(article.readingTimeMinutes, 'min') }} read</span>
        <NuxtLink
          :to="`/articles/${article.slug}`"
          class="font-bold text-teal-700 hover:underline dark:text-teal-300"
        >
          Read article
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
