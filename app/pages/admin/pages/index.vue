<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Pages' })
</script>

<template>
  <AdminContentList kind="pages" heading="Pages" />
</template>
