<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const notFound = computed(() => props.error.statusCode === 404)

useSiteHead()
useHead({ title: () => (notFound.value ? 'Page not found' : 'Something went wrong') })
</script>

<template>
  <NuxtLayout>
    <section class="mx-auto w-full max-w-2xl rounded-3xl bg-teal-900 p-8 text-white sm:p-12">
      <p class="text-sm font-bold tracking-[0.2em] text-teal-200 uppercase">
        {{ error.statusCode }}
      </p>
      <h1 class="mt-3 text-4xl font-black">
        {{ notFound ? 'We can\'t find that page.' : 'Something went wrong.' }}
      </h1>
      <p class="mt-5 leading-7 text-teal-50">
        {{ notFound
          ? 'It may have moved, or the link may be out of date.'
          : 'Please try again in a moment.' }}
      </p>
      <a href="/" class="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-teal-900">
        Return home
      </a>
    </section>
  </NuxtLayout>
</template>
