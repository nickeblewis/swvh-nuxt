<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Activities' })
</script>

<template>
  <AdminContentList kind="activities" heading="Activities" />
</template>
