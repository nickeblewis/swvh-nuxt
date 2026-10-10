<script setup lang="ts">
const site = useSite()

useSeoMeta({
  title: 'Booking',
  description: 'Hire the hall: what is included, how to book through the diary, and the terms of hire.',
})
</script>

<template>
  <article class="mx-auto w-full max-w-5xl">
    <PageHeader
      title="Booking"
      image="/images/village-hall/booking-garden.jpeg"
      :image-alt="`${site.name} garden`"
    />

    <div class="prose mt-10 max-w-none prose-stone dark:prose-invert">
      <p>The Hall can accommodate up to 140 people and includes the main hall area, the smaller Wellington Room, an equipped kitchen, stage, Gents, Ladies and Disabled toilets and enclosed garden.</p>
      <p>Disabled access is facilitated by ramps on front and rear doors. There is room for approx 8 cars in the front car park.</p>
      <p>
        Please ensure you are familiar with the
        <NuxtLink to="/terms-and-conditions">
          Terms and Conditions of Hire
        </NuxtLink>
        before booking.
      </p>
      <p>Please also understand that a returnable damage deposit is required at the time of booking, and the full hall hire charge is due four weeks before the booking date.</p>

      <h2>Diary</h2>
      <p>If you'd like to hire the hall, please use the diary below. Scroll along to the date which interests you, then click on the + sign for the chosen date. You will be asked to register as a new user and create a password.</p>
      <p>Once you have registered, you can then enter a preliminary booking by clicking on the chosen date + sign and entering a Booking Request, with all the details (full instructions on how to fill in the request will be on the screen).</p>
      <p>Please note – the Wellington Room can only be hired separately from the Main Hall Monday – Friday. The whole hall must be hired on Saturday and Sunday.</p>
      <p>That booking request will alert the Bookings Secretary, who will then be in contact with you.</p>
      <p>If you are contemplating a regular, or recurring, booking, you can register and complete the details for the first date. Please then contact the Bookings Secretary about organising ongoing bookings - do not tick the Recurring Booking box at this stage.</p>
      <p>If you want to change your password or have forgotten it, click the forgotten password. If you want to change your email address, contact the Bookings Secretary.</p>
    </div>

    <div class="mt-10">
      <BookingDiary />
    </div>
  </article>
</template>
