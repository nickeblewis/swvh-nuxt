<script setup lang="ts">
// Shown in place of the page once an enquiry has been sent.
</script>

<template>
  <section class="mx-auto w-full max-w-2xl rounded-3xl bg-teal-900 p-8 text-white sm:p-12">
    <p class="text-sm font-bold tracking-[0.2em] text-teal-200 uppercase">
      Thank you
    </p>
    <h1 class="mt-3 text-4xl font-black">
      Your message has been sent.
    </h1>
    <p class="mt-5 leading-7 text-teal-50">
      The Village Hall team will get back to you as soon as possible.
    </p>
    <NuxtLink to="/" class="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-teal-900">
      Return home
    </NuxtLink>
  </section>
</template>
