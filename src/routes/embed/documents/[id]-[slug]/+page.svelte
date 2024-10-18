<!-- @component
Assumes it's a child of a ViewerContext
 -->

<script lang="ts">
  import { _ } from "svelte-i18n";

  import ViewerContext from "@/lib/components/viewer/ViewerContext.svelte";
  import DocumentEmbed from "@/lib/components/embeds/DocumentEmbed.svelte";
  import EmbedLayout from "@/lib/components/layouts/EmbedLayout.svelte";

  // config and utils
  import { canonicalUrl, pdfUrl } from "$lib/api/documents";

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
  <EmbedLayout
    settings={data.settings}
    canonicalUrl={canonicalUrl(document).href}
    downloadUrl={pdfUrl(document).href}
  >
    <DocumentEmbed settings={data.settings} />
  </EmbedLayout>
</ViewerContext>
