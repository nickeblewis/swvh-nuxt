/**
 * The document head every page shares: title suffix, icons, language, body
 * colours and the theme script. Called from both app.vue and error.vue, because
 * the error page replaces app.vue rather than rendering inside it.
 */
export function useSiteHead() {
  const site = useSite()

  // Runs before first paint so a dark-mode visitor never sees a light flash.
  // The Theme button (ThemeToggle.vue) writes the same key.
  const themeScript = `(function(){try{var t=localStorage.getItem('swvh-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`

  useHead({
    titleTemplate: title => (title && title !== site.name ? `${title} — ${site.name}` : site.name),
    link: [
      { rel: 'icon', href: '/icon.png', type: 'image/png' },
      { rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: '/icon.png' },
    ],
    meta: [{ name: 'application-name', content: site.name }],
    script: [{ key: 'theme', innerHTML: themeScript, tagPosition: 'head' }],
    htmlAttrs: { lang: 'en-GB' },
    bodyAttrs: { class: 'bg-white text-stone-950 antialiased dark:bg-stone-950 dark:text-white' },
  })
}
