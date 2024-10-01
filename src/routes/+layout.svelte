<script>
  import { browser } from "$app/environment";
  import { locale } from "svelte-i18n";

  import "@/style/variables.css";
  import "@/style/global.css";
  import "@/style/kit.css";

  $: useCyrillicCharset = browser ? ["uk", "ru"].includes($locale) : false;
</script>

<svelte:head>
  <link rel="stylesheet" href="/fonts-latin.css" />
  {#if useCyrillicCharset}
    <link rel="stylesheet" href="/fonts-cyrillic.css" />
  {/if}
</svelte:head>

<slot />
