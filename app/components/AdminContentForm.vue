<script setup lang="ts">
/**
 * The new and edit screens for both activities and pages. The two share most
 * fields; the schedule and contact fields are activity-only, and the template
 * is page-only.
 */
const props = defineProps<{
  kind: 'activities' | 'pages'
  /** Omitted when creating. */
  id?: number
}>()

const { setNotice } = useFlash()

const isEdit = computed(() => props.id !== undefined)
const isActivity = computed(() => props.kind === 'activities')
const singular = computed(() => (isActivity.value ? 'Activity' : 'Page'))
const publicPath = computed(() => (isActivity.value ? '/regular-activities/' : '/'))

const form = reactive({
  title: '',
  slug: '',
  description: '',
  body: '',
  position: 0,
  draft: false,
  heroImagePath: '',
  heroImageAlt: '',
  sourceUrl: '',
  // Activities only.
  day: '',
  time: '',
  price: '',
  ageRange: '',
  contact: '',
  phone: '',
  externalUrl: '',
  // Pages only.
  template: 'standard',
})

if (isEdit.value) {
  const { data: record } = await useFetch<Record<string, unknown>>(
    () => `/api/admin/content/${props.kind}/${props.id}`,
  )
  if (!record.value) {
    throw createError({ statusCode: 404, statusMessage: `${singular.value} not found`, fatal: true })
  }

  // Copy across whichever of the form's fields this record has; nulls become blank.
  for (const key of Object.keys(form) as (keyof typeof form)[]) {
    const value = record.value[key]
    if (value !== undefined && value !== null) Object.assign(form, { [key]: value })
  }
}

const error = ref<string | null>(null)
const submitting = ref(false)

const inputClass
  = 'mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-900'
const labelClass = 'text-sm font-bold'
const hintClass = 'mt-1 text-xs text-stone-500 dark:text-stone-400'

async function save() {
  submitting.value = true
  error.value = null

  const shared = {
    title: form.title,
    slug: form.slug,
    description: form.description,
    body: form.body,
    position: Number(form.position) || 0,
    draft: form.draft,
    heroImagePath: form.heroImagePath,
    heroImageAlt: form.heroImageAlt,
    sourceUrl: form.sourceUrl,
  }
  const payload = isActivity.value
    ? {
        ...shared,
        day: form.day,
        time: form.time,
        price: form.price,
        ageRange: form.ageRange,
        contact: form.contact,
        phone: form.phone,
        externalUrl: form.externalUrl,
      }
    : { ...shared, template: form.template }

  try {
    if (isEdit.value) {
      await $fetch(`/api/admin/content/${props.kind}/${props.id}`, { method: 'PUT', body: payload })
      setNotice(`${singular.value} updated.`)
    }
    else {
      await $fetch(`/api/admin/content/${props.kind}`, { method: 'POST', body: payload })
      setNotice(`${singular.value} created.`)
    }
    await navigateTo(`/admin/${props.kind}`)
  }
  catch (requestError) {
    error.value
      = (requestError as { statusMessage?: string }).statusMessage ?? 'Could not save. Check the form.'
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="grid gap-8">
    <header>
      <h1 class="text-3xl font-black tracking-tight">
        {{ isEdit ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}` }}
      </h1>
    </header>

    <p
      v-if="error"
      role="alert"
      class="rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:bg-red-950 dark:text-red-200"
    >
      {{ error }}
    </p>

    <form class="grid max-w-3xl gap-5" @submit.prevent="save">
      <div>
        <label for="title" :class="labelClass">Title</label>
        <input id="title" v-model="form.title" type="text" required :class="inputClass">
      </div>

      <div>
        <label for="slug" :class="labelClass">Slug</label>
        <input id="slug" v-model="form.slug" type="text" pattern="[a-z0-9\-]+" :class="inputClass">
        <p :class="hintClass">
          The address will be {{ publicPath }}{{ form.slug || 'slug' }}. Lower-case letters, numbers and hyphens.
          Generated from the title if left blank.
        </p>
      </div>

      <div v-if="!isActivity">
        <label for="description" :class="labelClass">Description</label>
        <input id="description" v-model="form.description" type="text" :class="inputClass">
        <p :class="hintClass">
          Shown under the title, and to search engines.
        </p>
      </div>

      <template v-if="isActivity">
        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label for="day" :class="labelClass">Day</label>
            <input id="day" v-model="form.day" type="text" placeholder="Monday, Thursday" :class="inputClass">
          </div>
          <div>
            <label for="time" :class="labelClass">Time</label>
            <input id="time" v-model="form.time" type="text" placeholder="7:30 PM - 9:00 PM" :class="inputClass">
          </div>
        </div>
        <p :class="hintClass">
          The next session is worked out from these. Day can be one or more weekdays, or a rule such as
          “1st Sunday of month” or “Last Friday of month”. Anything else shows without a date.
        </p>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label for="price" :class="labelClass">Price</label>
            <input id="price" v-model="form.price" type="text" :class="inputClass">
          </div>
          <div>
            <label for="ageRange" :class="labelClass">Age range</label>
            <input id="ageRange" v-model="form.ageRange" type="text" :class="inputClass">
          </div>
          <div>
            <label for="contact" :class="labelClass">Contact email</label>
            <input id="contact" v-model="form.contact" type="email" :class="inputClass">
          </div>
          <div>
            <label for="phone" :class="labelClass">Contact phone</label>
            <input id="phone" v-model="form.phone" type="tel" :class="inputClass">
          </div>
        </div>

        <div>
          <label for="externalUrl" :class="labelClass">External URL</label>
          <input id="externalUrl" v-model="form.externalUrl" type="url" :class="inputClass">
          <p :class="hintClass">
            Shown as a “More information” button.
          </p>
        </div>
      </template>

      <div class="grid gap-5 sm:grid-cols-2">
        <div v-if="!isActivity">
          <label for="template" :class="labelClass">Template</label>
          <select id="template" v-model="form.template" :class="inputClass">
            <option value="standard">
              Standard
            </option>
            <option value="contact">
              Contact (adds the enquiry form)
            </option>
          </select>
        </div>
        <div>
          <label for="position" :class="labelClass">Position</label>
          <input id="position" v-model.number="form.position" type="number" step="1" :class="inputClass">
          <p :class="hintClass">
            Lower numbers come first.
          </p>
        </div>
      </div>

      <div>
        <label for="body" :class="labelClass">Body (markdown)</label>
        <textarea id="body" v-model="form.body" required rows="20" :class="`${inputClass} font-mono text-sm`" />
      </div>

      <fieldset class="grid gap-5 rounded-md border border-stone-300 p-4 dark:border-stone-700">
        <legend class="px-1 text-sm font-semibold">
          Image
        </legend>
        <div v-if="form.heroImagePath" class="flex items-center gap-4">
          <img :src="form.heroImagePath" alt="" class="h-20 w-32 rounded object-cover">
          <p class="text-sm text-stone-600 dark:text-stone-400">
            {{ form.heroImagePath }}
          </p>
        </div>
        <div>
          <label for="heroImagePath" :class="labelClass">Image path</label>
          <input
            id="heroImagePath"
            v-model="form.heroImagePath"
            type="text"
            :placeholder="`/images/${kind}/example.jpg`"
            :class="inputClass"
          >
          <p :class="hintClass">
            A file under <code>public/images</code> in the repository. Uploading from here isn't supported yet.
          </p>
        </div>
        <div>
          <label for="heroImageAlt" :class="labelClass">Alt text</label>
          <input
            id="heroImageAlt"
            v-model="form.heroImageAlt"
            type="text"
            placeholder="Describe the image for screen readers"
            :class="inputClass"
          >
        </div>
      </fieldset>

      <div>
        <label for="sourceUrl" :class="labelClass">Source URL</label>
        <input id="sourceUrl" v-model="form.sourceUrl" type="url" :class="inputClass">
        <p :class="hintClass">
          Where this content was originally copied from, for reference. Not shown on the site.
        </p>
      </div>

      <label class="flex items-center gap-2 text-sm font-semibold">
        <input v-model="form.draft" type="checkbox"> Draft
      </label>

      <div class="flex items-center gap-4">
        <button
          type="submit"
          :disabled="submitting"
          class="w-fit cursor-pointer rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ submitting ? 'Saving…' : `Save ${singular.toLowerCase()}` }}
        </button>
        <NuxtLink
          :to="`/admin/${kind}`"
          class="text-sm font-semibold text-stone-600 hover:text-teal-700 dark:text-stone-300 dark:hover:text-teal-300"
        >
          Cancel
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
