<script setup lang="ts">
useSeoMeta({
  title: 'Hall info',
  description: 'Specifications of the Main Hall and Wellington Room, licensing, kitchen and facilities.',
})
</script>

<template>
  <article class="mx-auto w-full max-w-5xl">
    <PageHeader
      title="Hall info"
      image="/images/village-hall/interior.jpg"
      image-alt="Inside the village hall"
    />

    <div class="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
      <div class="prose max-w-none prose-stone dark:prose-invert">
        <h2>Main Hall</h2>
        <ul>
          <li>The room seats up to 100 people</li>
          <li>Tables and chairs are provided. Suitable for birthday parties (sorry – teenage parties not allowed), weddings, family, community, meetings and business events.</li>
          <li>Full stage available</li>
          <li>Gents/Ladies and disabled toilet facilities</li>
          <li>Full equipped kitchen, with two gas cookers, two sinks, microwave and small fridge</li>
          <li>Baby changing facilities</li>
          <li>Ramp for disabled access</li>
          <li>Enclosed garden with electricity supply socket</li>
          <li>Available for public hire from 9am till midnight (12.30 on New Year's Eve)</li>
        </ul>
        <p><strong>L 14m (45ft) × W 7m (22.5ft)</strong></p>

        <h2>Wellington Room</h2>
        <ul>
          <li>Can accommodate up to 40 people</li>
          <li>Direct access to kitchen and toilets</li>
          <li>Can only be hired separately from the Main Hall Monday – Friday</li>
          <li>Often used as a food service area for events in the Main Hall. Can be set up as bar area, with an easy clean floor</li>
        </ul>
        <p><strong>L 7.5m (25ft) × W 5m (17ft)</strong></p>

        <h2>Licensing</h2>
        <p>The Village Hall holds a Performance Society Licence which permits the playing of copyright music in any form, or by performers in person.</p>

        <h2>Alcohol</h2>
        <p>If you wish to sell alcohol, a licence is required – you need to apply to Wokingham Borough Council to facilitate this. However, you are allowed to give alcohol to your guests free of charge without a licence.</p>

        <h2>Notes</h2>
        <ul>
          <li>There is a hall layout and safety drawing available for download from this website</li>
          <li>
            If you are in doubt about anything, please
            <NuxtLink to="/contact">
              contact the Bookings Secretary
            </NuxtLink>
          </li>
          <li>
            Please ensure you read and understand the hall
            <NuxtLink to="/terms-and-conditions">
              Terms and Conditions of Hire
            </NuxtLink>
          </li>
        </ul>
      </div>

      <figure>
        <a href="/images/village-hall/hall-plan.jpeg" target="_blank" rel="noopener">
          <img
            src="/images/village-hall/hall-plan.jpeg"
            alt="Hall layout and safety plan"
            class="w-full rounded-2xl border border-stone-200 dark:border-stone-800"
          >
        </a>
        <figcaption class="mt-3 text-sm text-stone-500">
          Hall layout and safety plan — select to open full size.
        </figcaption>
      </figure>
    </div>
  </article>
</template>
