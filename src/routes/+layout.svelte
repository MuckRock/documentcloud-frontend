<script lang="ts">
  import type { Snippet } from "svelte";

  import "@/style/kit.css";

  import { browser } from "$app/environment";
  import { beforeNavigate } from "$app/navigation";
  import { page, updated } from "$app/state";
  import { onMount } from "svelte";
  import { on } from "svelte/events";

  import { locale } from "svelte-i18n";
  import { getFlash } from "sveltekit-flash-message";

  import { toast } from "$lib/components/layouts/Toaster.svelte";

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  let useCyrillicCharset = $derived(
    browser && $locale ? ["uk", "ru"].includes($locale) : false,
  );

  const flash = getFlash(page);
  $effect(() => {
    if ($flash) {
      toast($flash.message, {
        status: $flash.status,
        lifespan: $flash.lifespan,
      });
      // Clear the flash message to avoid double-toasting.
      $flash = undefined;
    }
  });

  // this checks if the site has been updated and triggers a full page reload
  // on the next navigation to update the cache
  beforeNavigate(({ willUnload, to }) => {
    if (browser && updated.current && !willUnload && to?.url) {
      location.href = to.url.href;
    }
  });

  onMount(() => {
    // https://vite.dev/guide/build#load-error-handling
    const unsubscribe = on(window, "vite:preloadError", reload);
    return () => {
      unsubscribe();
    };
  });

  function reload(e: Event) {
    console.warn("Vite preload error");
    console.warn(e);
    window.location.reload();
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="/fonts-latin.css" />
  {#if useCyrillicCharset}
    <link rel="stylesheet" href="/fonts-cyrillic.css" />
  {/if}
</svelte:head>

{@render children?.()}
