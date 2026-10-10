<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const id = Number(route.params.id)

if (!Number.isInteger(id)) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useHead({ title: 'Edit page' })
</script>

<template>
  <AdminContentForm :id="id" kind="pages" />
</template>
