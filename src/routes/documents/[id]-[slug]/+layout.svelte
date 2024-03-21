<script lang="ts">
  import "@/style/kit.css";

  import MainLayout from "$lib/components/MainLayout.svelte";
  import DocumentMetadata from "./sidebar/DocumentMetadata.svelte";

  import { embedUrl } from "@/api/embed.js";
  import { pageImageUrl } from "@/api/viewer.js";
  import { canonicalUrl } from "@/lib/api/documents";

  export let data;

  $: document = data.document;
  $: canonical_url = canonicalUrl(document).toString();
</script>

<svelte:head>
  <!-- Insert canonical URL -->
  <link rel="canonical" href={document.canonical_url.toString()} />

  {#if document.noindex || document.admin_noindex}
    <meta name="robots" content="noindex" />
  {/if}
  <!-- Social cards -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="og:url" content={canonical_url} />
  <meta property="og:url" content={canonical_url} />
  <meta property="og:title" content={document.title} />
  <title>{document.title} - DocumentCloud</title>
  <link
    rel="alternate"
    type="application/json+oembed"
    href={embedUrl(document.canonical_url)}
    title={document.title}
  />
  {#if document?.description?.trim().length > 0}
    <meta property="og:description" content={document.description} />
  {/if}
  <meta property="og:image" content={pageImageUrl(document, 0, 700)} />
</svelte:head>

<MainLayout>
  <svelte:fragment slot="navigation">
    <DocumentMetadata {document} />
  </svelte:fragment>

  <slot slot="content" />

  <svelte:fragment slot="action"></svelte:fragment>
</MainLayout>
