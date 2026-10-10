<script setup lang="ts">
/**
 * The enquiry form, used on `/contact` and on admin-created pages with the
 * `contact` template. Emits `sent` once the enquiry has gone; the page then
 * swaps itself for `<ContactSent>`.
 */
const emit = defineEmits<{ sent: [] }>()

const site = useSite()

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
  // Honeypot: hidden from users, positioned off-screen, never focusable.
  // Netlify drops any submission where it's filled (`netlify-honeypot`).
  website: '',
})

const sending = ref(false)
const error = ref<string | null>(null)

const inputClass
  = 'mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-900'

// Netlify Forms. The form is registered from the static skeleton in
// public/__forms.html, and that file is also the POST target: posting to a
// rendered route would be swallowed by the Nitro server function and never
// reach Netlify's form handling. Field names here must match the skeleton.
const FORM_NAME = 'contact'
const FORM_ENDPOINT = '/__forms.html'

async function submit() {
  sending.value = true
  error.value = null

  // Netlify uses a field called `subject` as the notification's subject line.
  const subject = form.subject.replace(/\s+/g, ' ').trim()
    || `${site.name} contact enquiry from ${form.name.trim()}`

  // Nothing handles the POST outside Netlify, so local dev sends nothing.
  if (import.meta.dev) {
    console.info(`[Contact] Dev mode; skipping Netlify Forms submission: ${subject}`)
    sending.value = false
    emit('sent')
    return
  }

  try {
    // Must be URL-encoded: Netlify Forms does not accept JSON.
    await $fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ 'form-name': FORM_NAME, ...form, subject }).toString(),
    })
    emit('sent')
  }
  catch {
    error.value = `Sorry, we couldn't send your message. Please email us at ${site.email}.`
  }
  finally {
    sending.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-black">
      Send an enquiry
    </h2>
    <p
      v-if="error"
      role="alert"
      class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:bg-red-950 dark:text-red-200"
    >
      {{ error }}
    </p>
    <form name="contact" method="post" class="mt-6 grid gap-5" @submit.prevent="submit">
      <div class="absolute -left-[9999px]" aria-hidden="true">
        <label for="website">Leave this field empty</label>
        <input id="website" v-model="form.website" name="website" type="text" tabindex="-1" autocomplete="off">
      </div>
      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label for="name" class="text-sm font-bold">Name</label>
          <input id="name" v-model="form.name" name="name" type="text" required autocomplete="name" :class="inputClass">
        </div>
        <div>
          <label for="email" class="text-sm font-bold">Email</label>
          <input id="email" v-model="form.email" name="email" type="email" required autocomplete="email" :class="inputClass">
        </div>
      </div>
      <div>
        <label for="subject" class="text-sm font-bold">Subject</label>
        <input id="subject" v-model="form.subject" name="subject" type="text" maxlength="200" :class="inputClass">
      </div>
      <div>
        <label for="message" class="text-sm font-bold">Message</label>
        <textarea id="message" v-model="form.message" name="message" required rows="6" maxlength="5000" :class="inputClass" />
      </div>
      <button
        type="submit"
        :disabled="sending"
        class="w-fit cursor-pointer rounded-full bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ sending ? 'Sending…' : 'Send enquiry' }}
      </button>
    </form>
  </div>
</template>
