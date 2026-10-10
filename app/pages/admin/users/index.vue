<script setup lang="ts">
// Lists admin users, adds new ones and sets passwords.
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { user: currentUser } = useUserSession()
const { setNotice, setAlert } = useFlash()

const { data: users, refresh } = await useFetch('/api/admin/users')

const form = reactive({ email: '', password: '' })
const submitting = ref(false)
const error = ref<string | null>(null)

const inputClass
  = 'mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-900'

async function create() {
  submitting.value = true
  error.value = null

  try {
    await $fetch('/api/admin/users', { method: 'POST', body: form })
    setNotice('Admin user created.')
    form.email = ''
    form.password = ''
    await refresh()
  }
  catch (requestError) {
    error.value = (requestError as { statusMessage?: string }).statusMessage ?? 'Could not create user.'
  }
  finally {
    submitting.value = false
  }
}

async function resetPassword(id: number, email: string) {
  const password = prompt(`New password for ${email} (minimum 12 characters):`)
  if (!password) return

  try {
    await $fetch(`/api/admin/users/${id}`, { method: 'PUT', body: { password } })
    setNotice(`Password updated for ${email}.`)
  }
  catch (requestError) {
    setAlert((requestError as { statusMessage?: string }).statusMessage ?? 'Could not update password.')
  }
}

async function remove(id: number, email: string) {
  if (!confirm(`Delete ${email}?`)) return

  try {
    await $fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    setNotice('Admin user deleted.')
    await refresh()
  }
  catch (requestError) {
    setAlert((requestError as { statusMessage?: string }).statusMessage ?? 'Could not delete user.')
  }
}

useHead({ title: 'Admin users' })
</script>

<template>
  <div class="grid gap-8">
    <header>
      <h1 class="text-4xl font-black tracking-tight text-stone-950 dark:text-white">
        Admin users
      </h1>
      <p class="mt-2 text-sm text-stone-600 dark:text-stone-300">
        There is no emailed password reset. An existing admin sets passwords here.
      </p>
    </header>

    <div
      v-if="users?.length"
      class="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800"
    >
      <table class="w-full text-left text-sm">
        <thead class="bg-stone-50 text-xs tracking-[0.14em] text-stone-600 uppercase dark:bg-stone-900 dark:text-stone-400">
          <tr>
            <th scope="col" class="px-4 py-3">
              Email
            </th>
            <th scope="col" class="px-4 py-3">
              Added
            </th>
            <th scope="col" class="px-4 py-3 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-200 dark:divide-stone-800">
          <tr v-for="user in users" :key="user.id">
            <td class="px-4 py-3 font-semibold text-stone-950 dark:text-white">
              {{ user.email }}
              <span v-if="user.id === currentUser?.id" class="ml-2 text-xs font-normal text-stone-500">(you)</span>
            </td>
            <td class="px-4 py-3 text-stone-600 dark:text-stone-300">
              {{ formatShortDate(user.createdAt) }}
            </td>
            <td class="px-4 py-3 text-right">
              <button
                type="button"
                class="cursor-pointer font-semibold text-teal-700 hover:underline dark:text-teal-300"
                @click="resetPassword(user.id, user.email)"
              >
                Set password
              </button>
              <button
                v-if="user.id !== currentUser?.id"
                type="button"
                class="ml-4 cursor-pointer font-semibold text-red-700 hover:underline dark:text-red-400"
                @click="remove(user.id, user.email)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <section class="max-w-md">
      <h2 class="text-lg font-bold text-stone-950 dark:text-white">
        Add an admin user
      </h2>

      <p
        v-if="error"
        role="alert"
        class="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:bg-red-950 dark:text-red-200"
      >
        {{ error }}
      </p>

      <form class="mt-4 grid gap-5" @submit.prevent="create">
        <div>
          <label for="newEmail" class="text-sm font-bold">Email</label>
          <input id="newEmail" v-model="form.email" type="email" required :class="inputClass">
        </div>
        <div>
          <label for="newPassword" class="text-sm font-bold">Password</label>
          <input
            id="newPassword"
            v-model="form.password"
            type="password"
            required
            minlength="12"
            autocomplete="new-password"
            :class="inputClass"
          >
        </div>
        <button
          type="submit"
          :disabled="submitting"
          class="w-fit cursor-pointer rounded-md bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ submitting ? 'Creating…' : 'Create admin user' }}
        </button>
      </form>
    </section>
  </div>
</template>
