<script lang="ts">
  import type { PageData } from "./$types";
  import { embedUrl } from "@/api/embed.js";
  import { pageImageUrl } from "@/api/viewer.js";

  export let data: PageData;
</script>

<svelte:head>
  <!-- Insert canonical URL -->
  <link rel="canonical" href={data.document.canonical_url} />

  {#if data.document.noindex || data.document.admin_noindex}
    <meta name="robots" content="noindex" />
  {/if}
  <!-- Social cards -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="og:url" content={data.document.canonical_url} />
  <meta property="og:url" content={data.document.canonical_url} />
  <meta property="og:title" content={data.document.title} />
  <title>{data.document.title} - DocumentCloud</title>
  <link
    rel="alternate"
    type="application/json+oembed"
    href={embedUrl(data.document.canonical_url)}
    title={data.document.title}
  />
  {#if data.document?.description?.trim().length > 0}
    <meta property="og:description" content={data.document.description} />
  {/if}
  <meta property="og:image" content={pageImageUrl(data.document, 0, 700, 1)} />
</svelte:head>

<h1>{data.document.title}</h1>
