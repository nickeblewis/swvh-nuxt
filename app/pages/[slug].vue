<script setup lang="ts">
/**
 * An admin-created page. The built-in pages are their own files in this
 * directory and take priority over this catch-all, which is why their slugs
 * are reserved (`RESERVED_PAGE_SLUGS` in server/utils/admin-content.ts).
 */
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data: page } = await useFetch(() => `/api/pages/${slug.value}`)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const sent = ref(false)

useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description ?? undefined,
  ogTitle: () => page.value?.title,
  ogImage: () => page.value?.heroImagePath ?? undefined,
})
</script>

<template>
  <ContactSent v-if="sent" />
  <article v-else-if="page" class="mx-auto w-full max-w-4xl">
    <PageHeader
      :title="page.title"
      :intro="page.description"
      :image="page.heroImagePath"
      :image-alt="page.heroImageAlt"
    />
    <ContentBody :body="page.body" />
    <div v-if="page.template === 'contact'" class="mt-12 border-t border-stone-200 pt-10 dark:border-stone-800">
      <ContactForm @sent="sent = true" />
    </div>
  </article>
</template>
