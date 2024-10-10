<script lang="ts">
  import { canonicalUrl } from "$lib/api/documents";
  import ViewerContext from "@/lib/components/viewer/ViewerContext.svelte";

  export let data;

  $: document = data.document;
  $: mode = data.mode;
  $: text = data.text;
  $: asset_url = data.asset_url;
  $: canonical_url = canonicalUrl(document).href;
</script>

<svelte:head>
  <title>{document.title} | DocumentCloud</title>

  <!-- Insert canonical URL -->
  <link rel="canonical" href={canonical_url} />

  {#if document.noindex || document.admin_noindex}
    <meta name="robots" content="noindex" />
  {/if}
</svelte:head>

<ViewerContext {document} {mode} {text} {asset_url}>
  <slot />
</ViewerContext>
