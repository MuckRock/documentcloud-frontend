<script lang="ts">
  import { browser } from "$app/environment";
  import { beforeNavigate } from "$app/navigation";
  import { updated } from "$app/stores";

  import { locale } from "svelte-i18n";

  import "@/style/variables.css";
  import "@/style/global.css";
  import "@/style/kit.css";

  $: useCyrillicCharset = browser ? ["uk", "ru"].includes($locale) : false;

  // this checks if the site has been updated and triggers a full page reload
  // on the next navigation to update the cache
  beforeNavigate(({ willUnload, to }) => {
    if ($updated && !willUnload && to?.url) {
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
