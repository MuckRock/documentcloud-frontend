<script lang="ts">
  import { browser } from "$app/environment";
  import { beforeNavigate } from "$app/navigation";
  import { page, updated } from "$app/stores";

  import { locale } from "svelte-i18n";
  import { getFlash } from "sveltekit-flash-message";

  import "@/style/variables.css";
  import "@/style/legacy.css";
  import "@/style/kit.css";

  import { toast } from "@/lib/components/layouts/Toaster.svelte";

  $: useCyrillicCharset =
    browser && $locale ? ["uk", "ru"].includes($locale) : false;

  const flash = getFlash(page);
  $: if ($flash) {
    toast($flash.message, {
      status: $flash.status,
      lifespan: $flash.lifespan,
    });
    // Clear the flash message to avoid double-toasting.
    $flash = undefined;
  }

  // this checks if the site has been updated and triggers a full page reload
  // on the next navigation to update the cache
  beforeNavigate(({ willUnload, to }) => {
    if (browser && $updated && !willUnload && to?.url) {
      location.href = to.url.href;
    }
  });

  // https://vite.dev/guide/build#load-error-handling
  function reload() {
    window.location.reload();
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="/fonts-latin.css" />
  {#if useCyrillicCharset}
    <link rel="stylesheet" href="/fonts-cyrillic.css" />
  {/if}
</svelte:head>

<svelte:window on:vite:preloadError={reload} />

<slot />
