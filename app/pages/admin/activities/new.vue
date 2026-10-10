<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'New activity' })
</script>

<template>
  <AdminContentForm kind="activities" />
</template>
