<script setup lang="ts">
const site = useSite()

const { data: home } = await useFetch('/api/home')

// Shown as tags under "Groups include". Each links to an activity by slug.
const groups = [
  { label: 'Badminton', slug: 'badminton-club' },
  { label: 'Berzerk Drama Classes', slug: 'berzerk-productions' },
  { label: 'Bloom Baby', slug: 'bloom-baby' },
  { label: 'Board Games', slug: 'board-games' },
  { label: 'Boxercise', slug: 'ladies-only-boxercise' },
  { label: 'Brownies', slug: '1st-spencers-wood-brownies' },
  { label: 'Calming Space', slug: 'calming-space-relaxation-and-sound-immersion' },
  { label: 'Guides', slug: '1st-spencers-wood-guides' },
  { label: 'Martial Arts', slug: 'kyushindo-karate-club' },
  { label: 'Community Craft Group', slug: 'community-craft-group' },
  { label: 'Over 50s Exercise', slug: 'over-50s-exercise' },
  { label: 'Yoga', slug: 'yoga-with-tash' },
]

useSeoMeta({
  description: 'A welcoming village hall for local activities, events, celebrations and private hire.',
})
</script>

<template>
  <section class="relative overflow-hidden rounded-[2rem] bg-teal-900 px-6 py-16 text-white sm:px-12 sm:py-24">
    <img
      src="/images/village-hall/hall.jpg"
      :alt="site.name"
      class="absolute inset-0 h-full w-full object-cover opacity-25"
    >
    <div class="relative max-w-3xl">
      <p class="mb-5 text-sm font-bold tracking-[0.22em] text-teal-200 uppercase">
        {{ site.locality }}
      </p>
      <h1 class="max-w-2xl text-5xl font-black tracking-tight sm:text-7xl">
        At the heart of the community.
      </h1>
      <p class="mt-7 max-w-xl text-lg leading-8 text-teal-50">
        A welcoming village hall for local activities, events, celebrations and private hire.
      </p>
      <div class="mt-9 flex flex-wrap gap-3">
        <NuxtLink
          to="/regular-activities"
          class="rounded-full bg-white px-5 py-3 text-sm font-bold text-teal-900 hover:bg-teal-50"
        >
          Explore activities
        </NuxtLink>
        <NuxtLink
          to="/booking"
          class="rounded-full border border-teal-300 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
        >
          Book the hall
        </NuxtLink>
      </div>
    </div>
  </section>

  <section class="grid gap-10 py-4 lg:grid-cols-[1fr_1.4fr] lg:items-start">
    <div>
      <p class="text-sm font-bold tracking-[0.2em] text-teal-700 uppercase dark:text-teal-300">
        Welcome
      </p>
      <h2 class="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
        Come on in, there is something for everyone
      </h2>
      <div class="mt-8 grid grid-cols-2 gap-3">
        <img
          src="/images/village-hall/interior.jpg"
          alt="Inside the village hall"
          class="col-span-2 aspect-[16/9] w-full rounded-2xl object-cover"
        >
        <img
          src="/images/village-hall/activities.jpg"
          alt="Activities at the village hall"
          class="aspect-square w-full rounded-2xl object-cover"
        >
        <img
          src="/images/village-hall/booking-garden.jpeg"
          alt="The village hall garden"
          class="aspect-square w-full rounded-2xl object-cover"
        >
      </div>
    </div>
    <div class="prose max-w-none prose-stone dark:prose-invert">
      <p>Our aim is to maintain and develop the use of the hall so that it provides a top-class facility for people in the local area, to be able to enjoy a range of activities and to enable private hire.</p>
      <p>Our vision is that Spencer's Wood Village Hall continues to serve as a key part of our community, for the benefit of all residents.</p>

      <h2>Groups include</h2>
      <p>
        <NuxtLink
          v-for="group in groups"
          :key="group.slug"
          :to="`/regular-activities/${group.slug}`"
          class="home-chip"
        >
          {{ group.label }}
        </NuxtLink>
      </p>
      <p>
        <NuxtLink to="/regular-activities" class="home-pill">
          View all activities
        </NuxtLink>
      </p>

      <h2>Diary &amp; Booking</h2>
      <p>The hall can accommodate up to 140 people and includes the main hall area, the smaller Wellington Room, an equipped kitchen, stage, accessible toilets and an enclosed garden.</p>
      <p>
        <NuxtLink to="/booking" class="home-pill">
          View diary and book
        </NuxtLink>
      </p>
    </div>
  </section>

  <section class="border-t border-stone-200 pt-10 dark:border-stone-800">
    <div class="flex items-end justify-between gap-5">
      <div>
        <p class="text-sm font-bold tracking-[0.2em] text-teal-700 uppercase dark:text-teal-300">
          Regular Activities
        </p>
        <h2 class="mt-2 text-3xl font-black tracking-tight">
          What's on next
        </h2>
        <p v-if="home" class="mt-2 text-stone-600 dark:text-stone-400">
          Today is {{ home.today }}
        </p>
      </div>
      <NuxtLink
        to="/regular-activities"
        class="hidden text-sm font-bold text-teal-700 hover:text-teal-900 sm:block dark:text-teal-300"
      >
        View all
      </NuxtLink>
    </div>
    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ActivityCard v-for="activity in home?.upcoming ?? []" :key="activity.slug" :activity="activity" compact />
    </div>
  </section>

  <section
    class="grid gap-8 rounded-[2rem] bg-amber-100 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center dark:bg-stone-900"
  >
    <div>
      <p class="text-sm font-bold tracking-[0.2em] text-amber-800 uppercase dark:text-amber-300">
        Diary &amp; booking
      </p>
      <h2 class="mt-3 text-3xl font-black tracking-tight">
        Book your space.
      </h2>
      <p class="mt-4 max-w-2xl leading-7 text-stone-700 dark:text-stone-300">
        Our main hall, Wellington Room, kitchen, stage and garden can accommodate community activities, celebrations and private hire.
      </p>
    </div>
    <NuxtLink
      to="/booking"
      class="rounded-full bg-stone-950 px-5 py-3 text-center text-sm font-bold text-white hover:bg-teal-800 dark:bg-white dark:text-stone-950"
    >
      View booking information
    </NuxtLink>
    <ul v-if="home?.spaces.length" class="flex flex-wrap gap-3 lg:col-span-2" aria-label="Spaces available to book">
      <SpaceChip v-for="space in home.spaces" :key="space.slug" :space="space" />
    </ul>
  </section>
</template>
