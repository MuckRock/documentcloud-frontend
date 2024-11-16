<!-- @component
Assumes it's a child of a ViewerContext
 -->

<script lang="ts">
  import DocumentEmbed from "$lib/components/embeds/DocumentEmbed.svelte";
  import EmbedLayout from "$lib/components/layouts/EmbedLayout.svelte";
  import ViewerContext from "$lib/components/viewer/ViewerContext.svelte";

  // config and utils
  import * as documents from "$lib/api/documents";

  export let data;

  $: document = data.document;
  $: mode = data.mode;
  $: text = documents.text(document);
  $: asset_url = data.asset_url;
  $: canonical_url = documents.canonicalUrl(document).href;
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
  <EmbedLayout
    settings={data.settings}
    canonicalUrl={canonical_url}
    downloadUrl={documents.pdfUrl(document).href}
  >
    <DocumentEmbed settings={data.settings} />
  </EmbedLayout>
</ViewerContext>
