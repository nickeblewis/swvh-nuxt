<script setup lang="ts">
// The admin sign-in screen. Renders without a layout.
definePageMeta({ layout: false })

const site = useSite()
const { loggedIn, fetch: refreshSession } = useUserSession()

const credentials = reactive({ email: '', password: '' })
const error = ref<string | null>(null)
const submitting = ref(false)

const inputClass
  = 'mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-900'

// Already signed in? Nothing to do here.
watchEffect(() => {
  if (loggedIn.value) navigateTo('/admin')
})

async function signIn() {
  submitting.value = true
  error.value = null

  try {
    await $fetch('/api/admin/login', { method: 'POST', body: credentials })
    await refreshSession()
    await navigateTo('/admin')
  }
  catch (requestError) {
    error.value
      = (requestError as { statusMessage?: string }).statusMessage ?? 'Invalid email or password.'
  }
  finally {
    submitting.value = false
  }
}

useHead({
  title: `Sign in — ${site.name} Admin`,
  meta: [{ name: 'robots', content: 'noindex,nofollow' }],
})
</script>

<template>
  <div class="min-h-screen bg-white text-stone-950 antialiased dark:bg-stone-950 dark:text-white">
    <main class="mx-auto grid max-w-md gap-8 px-5 py-20">
      <header>
        <h1 class="text-3xl font-black tracking-tight text-stone-950 dark:text-white">
          {{ site.name }} Admin
        </h1>
        <p class="mt-2 text-stone-600 dark:text-stone-300">
          Sign in to manage activities and pages.
        </p>
      </header>

      <p
        v-if="error"
        role="alert"
        class="rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:bg-red-950 dark:text-red-200"
      >
        {{ error }}
      </p>

      <form class="grid gap-5" @submit.prevent="signIn">
        <div>
          <label for="email" class="text-sm font-bold">Email</label>
          <input
            id="email"
            v-model="credentials.email"
            type="email"
            required
            autocomplete="username"
            :class="inputClass"
          >
        </div>

        <div>
          <label for="password" class="text-sm font-bold">Password</label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            required
            autocomplete="current-password"
            :class="inputClass"
          >
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="w-fit cursor-pointer rounded-md bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ submitting ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <NuxtLink to="/" class="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300">
        Back to the site
      </NuxtLink>
    </main>
  </div>
</template>
