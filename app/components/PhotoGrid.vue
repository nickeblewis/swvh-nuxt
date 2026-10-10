<script setup lang="ts">
import type { GalleryPhoto } from '#shared/types/content'

/** A masonry-style grid: photos keep their own shape and nestle together in columns. */
defineProps<{ photos: GalleryPhoto[] }>()
</script>

<template>
  <div v-if="photos.length" class="mt-8 columns-2 gap-2 sm:columns-3 [&>*]:mb-2">
    <a
      v-for="photo in photos"
      :key="photo.path"
      :href="photo.path"
      target="_blank"
      rel="noopener"
      class="group block break-inside-avoid overflow-hidden rounded-xl"
    >
      <img
        :src="photo.path"
        :alt="photo.alt"
        loading="lazy"
        class="w-full transition duration-300 group-hover:scale-[1.03]"
      >
    </a>
  </div>
</template>
