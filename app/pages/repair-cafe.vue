<script setup lang="ts">
import type { GalleryPhoto } from '#shared/types/content'

const site = useSite()

// The badge under the title comes from the cafe's entry in Regular Activities.
const { data } = await useFetch('/api/occurrences/repair-cafe')

// Every image in public/images/repair-cafe, listed at build time (nuxt.config.ts).
// Cast because Nuxt's generated runtime config types don't describe objects inside arrays.
const photos = useRuntimeConfig().public.galleries.repairCafe as GalleryPhoto[]

useSeoMeta({
  title: 'Repair Cafe',
  description: 'A friendly group of expert volunteers running a repair session at the Village Hall on the first Sunday of the month, 10 am to 1 pm.',
})
</script>

<template>
  <article class="mx-auto w-full max-w-4xl">
    <PageHeader
      title="Spencers Wood Village Hall Repair Cafe"
      eyebrow="Repair Cafe"
      :occurrence="data?.occurrence"
    />

    <div class="prose prose-xl mt-10 max-w-none prose-stone dark:prose-invert">
      <p>Spencers Wood Village Hall Repair Cafe is a friendly group of expert volunteers that run a session once a month at the Village Hall, open the first Sunday of the month from 10 am to 1 pm.</p>
    </div>

    <PhotoGrid :photos="photos" />

    <div class="prose mt-10 max-w-none prose-stone dark:prose-invert">
      <p>We will try to repair any household items that may otherwise be destined for landfill. Our ethos is very much reduce, reuse, recycle and our volunteers are happy to share their skills.</p>
      <p>We do not charge for our service, but very much appreciate donations. Donations go towards out-of-pocket costs to our volunteers and Spencers Wood Village Hall, a registered charity.</p>
    </div>

    <div class="mt-8 flex flex-wrap gap-3">
      <a
        :href="`mailto:${site.email}`"
        class="inline-flex rounded-full bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
      >Enquiries: {{ site.email }}</a>
      <a
        href="https://www.facebook.com/groups/453985379084488/"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex rounded-full bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
      >Follow us on Facebook →</a>
    </div>
  </article>
</template>
