<script>
  import "@/style/variables.css";
  import "@/style/global.css";
  import "@/style/kit.css";

  import { locale } from "svelte-i18n";

  $: useCyrillicCharset = ["uk", "ru"].includes($locale);
</script>

<svelte:head>
  {#if useCyrillicCharset}
    <link rel="stylesheet" href="/fonts-cyrillic.css" />
  {:else}
    <link rel="stylesheet" href="/fonts-latin.css" />
  {/if}
</svelte:head>

<slot />
