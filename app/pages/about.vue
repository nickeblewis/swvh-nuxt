<script setup lang="ts">
const site = useSite()

const intro = 'Spencers Wood Village Hall is a registered charity run by trustees and a management committee, serving the community since 1911.'

const cards = [
  {
    title: 'Hall info',
    to: '/hall-info',
    image: '/images/village-hall/hall-plan.jpeg',
    summary: 'Specifications of the Main Hall and Wellington Room, licensing, kitchen and facilities.',
  },
  {
    title: 'History',
    to: '/history',
    image: '/images/village-hall/history-1.jpeg',
    summary: 'How Spencers Wood Village Hall came to be — from its origins in 1911 as St. Michael\'s Hall to today.',
  },
  {
    title: 'The Committee',
    to: '/the-committee',
    image: '/images/village-hall/hall.jpg',
    summary: `The Trustees and Management Committee who run the hall as a registered charity (No. ${site.charityNumber}).`,
  },
]

useSeoMeta({ title: 'About', description: intro })
</script>

<template>
  <article class="mx-auto w-full max-w-5xl">
    <PageHeader title="About" :intro="intro" />

    <div class="mt-10 grid gap-6 sm:grid-cols-3">
      <LinkCard v-for="card in cards" :key="card.to" v-bind="card" />
    </div>
  </article>
</template>
