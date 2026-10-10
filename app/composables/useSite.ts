/**
 * Site identity: name, email, address, charity number and so on.
 * Values come from `runtimeConfig.public.site` in nuxt.config.ts.
 *
 * Never hard-code these in a component — read them from here so there's one
 * place to change them.
 */
export function useSite() {
  return useRuntimeConfig().public.site
}
