<script setup lang="ts">
/** The admin dashboard: one card per tool, with a count. */
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { user } = useUserSession()
const { data: stats } = await useFetch('/api/admin/stats')

const cards = computed(() => [
  { label: 'Activities', count: stats.value?.activities ?? 0, to: '/admin/activities' },
  { label: 'Pages', count: stats.value?.pages ?? 0, to: '/admin/pages' },
  { label: 'Admin users', count: stats.value?.users ?? 0, to: '/admin/users' },
])

useHead({ title: 'Dashboard' })
</script>

<template>
  <div class="grid gap-8">
    <header>
      <h1 class="text-3xl font-black tracking-tight">
        Dashboard
      </h1>
      <p class="mt-2 text-stone-600 dark:text-stone-300">
        Signed in as {{ user?.email }}.
      </p>
    </header>

    <section class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <NuxtLink
        v-for="card in cards"
        :key="card.to"
        :to="card.to"
        class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900"
      >
        <p class="text-sm font-bold tracking-[0.2em] text-teal-700 uppercase dark:text-teal-300">
          {{ card.label }}
        </p>
        <p class="mt-3 text-4xl font-black">
          {{ card.count }}
        </p>
      </NuxtLink>
    </section>

    <section class="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
      <h2 class="text-lg font-black">
        What isn't edited here
      </h2>
      <ul class="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-stone-600 dark:text-stone-300">
        <li>
          The built-in pages (home, market, repair cafe, booking, contact, about, hall info, history, the
          committee, terms) are part of the site's code.
        </li>
        <li>Articles are markdown files in <code>content/articles</code> in the repository.</li>
        <li>
          The {{ stats?.spaces ?? 0 }} spaces shown on the home page, and all images, are also changed in the
          repository.
        </li>
      </ul>
    </section>
  </div>
</template>
