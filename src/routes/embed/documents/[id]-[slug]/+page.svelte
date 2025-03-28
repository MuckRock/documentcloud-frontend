<!-- @component
Assumes it's a child of a ViewerContext
 -->

<script lang="ts">
  import { browser } from "$app/environment";

  import DocumentEmbed from "$lib/components/embeds/DocumentEmbed.svelte";
  import EmbedLayout from "$lib/components/layouts/EmbedLayout.svelte";
  import ViewerContext from "$lib/components/viewer/ViewerContext.svelte";

  // config and utils
  import { text as textData, canonicalUrl, pdfUrl } from "$lib/api/documents";

  export let data;

  $: document = data.document;
  $: mode = data.mode;
  $: text = browser
    ? textData(document)
    : Promise.resolve({ pages: [], updated: 0 });
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

  <link
    rel="prefetch"
    href={asset_url.href}
    as="fetch"
    crossorigin="anonymous"
    type="application/pdf"
  />
</svelte:head>

<ViewerContext {document} {mode} {text} {asset_url}>
  <EmbedLayout
    settings={data.settings}
    canonicalUrl={canonical_url}
    downloadUrl={pdfUrl(document).href}
  >
    <DocumentEmbed settings={data.settings} />
  </EmbedLayout>
</ViewerContext>
