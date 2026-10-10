<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'New page' })
</script>

<template>
  <AdminContentForm kind="pages" />
</template>
