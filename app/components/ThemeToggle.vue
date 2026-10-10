<script setup lang="ts">
// Flips the `.dark` class on <html> and remembers the choice. The matching
// script in app.vue applies it before first paint on the next visit.
function toggle() {
  const root = document.documentElement
  root.classList.toggle('dark')
  try {
    localStorage.setItem('swvh-theme', root.classList.contains('dark') ? 'dark' : 'light')
  }
  catch {
    // Storage can be unavailable (private browsing); the toggle still works for this page.
  }
}
</script>

<template>
  <button
    type="button"
    class="cursor-pointer rounded-full border border-stone-300 px-3 py-1.5 text-xs hover:border-teal-600 dark:border-stone-700 dark:hover:border-teal-400"
    aria-label="Toggle colour theme"
    @click="toggle"
  >
    Theme
  </button>
</template>
