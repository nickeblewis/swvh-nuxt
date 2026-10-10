<script setup lang="ts">
const { clear } = useUserSession()

useHead({
  meta: [{ name: 'robots', content: 'noindex,nofollow' }],
})

async function signOut() {
  await clear()
  await navigateTo('/admin/login')
}
</script>

<template>
  <main class="mx-auto grid max-w-6xl gap-10 overflow-hidden px-5 py-6 sm:px-8 lg:px-0">
    <header class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-stone-200 pb-5 dark:border-stone-800">
      <NuxtLink
        to="/admin"
        class="text-xl font-black tracking-tight text-stone-950 dark:text-white"
      >
        Village Hall Admin
      </NuxtLink>
      <nav class="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-semibold text-stone-600 dark:text-stone-300">
        <NuxtLink to="/admin/pages" class="hover:text-teal-700 dark:hover:text-teal-300">
          Pages
        </NuxtLink>
        <NuxtLink to="/admin/activities" class="hover:text-teal-700 dark:hover:text-teal-300">
          Activities
        </NuxtLink>
        <NuxtLink to="/admin/users" class="hover:text-teal-700 dark:hover:text-teal-300">
          Admin Users
        </NuxtLink>
        <NuxtLink to="/" class="hover:text-teal-700 dark:hover:text-teal-300">
          View site
        </NuxtLink>
        <button
          type="button"
          class="cursor-pointer font-semibold text-stone-600 hover:text-teal-700 dark:text-stone-300 dark:hover:text-teal-300"
          @click="signOut"
        >
          Sign out
        </button>
        <ThemeToggle />
      </nav>
    </header>

    <FlashMessages />

    <slot />
  </main>
</template>
