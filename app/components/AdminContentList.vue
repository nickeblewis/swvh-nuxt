<script setup lang="ts">
/** The list screen for `/admin/activities` and `/admin/pages`. */
const props = defineProps<{
  kind: 'activities' | 'pages'
  heading: string
}>()

const { setNotice, setAlert } = useFlash()

const { data: items, refresh } = await useFetch(() => `/api/admin/content/${props.kind}`)

const isActivity = computed(() => props.kind === 'activities')
const singular = computed(() => (isActivity.value ? 'Activity' : 'Page'))

async function remove(id: number, title: string) {
  if (!confirm(`Delete "${title}"? This cannot be undone.`)) return

  try {
    await $fetch(`/api/admin/content/${props.kind}/${id}`, { method: 'DELETE' })
    setNotice(`${singular.value} deleted.`)
    await refresh()
  }
  catch (error) {
    setAlert((error as { statusMessage?: string }).statusMessage ?? 'Could not delete.')
  }
}
</script>

<template>
  <div class="grid gap-8">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-3xl font-black tracking-tight">
        {{ heading }}
      </h1>
      <NuxtLink
        :to="`/admin/${kind}/new`"
        class="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
      >
        New {{ singular.toLowerCase() }}
      </NuxtLink>
    </header>

    <div
      v-if="items?.length"
      class="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800"
    >
      <table class="w-full text-left text-sm">
        <thead class="bg-stone-50 dark:bg-stone-900">
          <tr>
            <th scope="col" class="px-4 py-3">
              Title
            </th>
            <th scope="col" class="px-4 py-3">
              {{ isActivity ? 'Schedule' : 'Address' }}
            </th>
            <th scope="col" class="px-4 py-3">
              Status
            </th>
            <th scope="col" class="px-4 py-3 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" class="border-t border-stone-200 dark:border-stone-800">
            <td class="px-4 py-3 font-semibold">
              <NuxtLink :to="`/admin/${kind}/${item.id}`" class="hover:text-teal-700 dark:hover:text-teal-300">
                {{ item.title }}
              </NuxtLink>
            </td>
            <td class="px-4 py-3 text-stone-600 dark:text-stone-300">
              {{ item.summary || '—' }}
            </td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-1 text-xs font-semibold"
                :class="item.draft
                  ? 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                  : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200'"
              >
                {{ item.draft ? 'Draft' : 'Published' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <NuxtLink
                :to="`/admin/${kind}/${item.id}`"
                class="font-semibold text-teal-700 hover:underline dark:text-teal-300"
              >
                Edit
              </NuxtLink>
              <button
                type="button"
                class="ml-4 cursor-pointer font-semibold text-red-700 hover:underline dark:text-red-400"
                @click="remove(item.id, item.title)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-stone-600 dark:text-stone-300">
      No {{ kind }} yet.
    </p>
  </div>
</template>
