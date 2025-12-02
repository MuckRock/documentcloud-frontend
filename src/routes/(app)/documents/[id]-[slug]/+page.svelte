<!-- @component
  Assumes it's a child of a ViewerContext
 -->

<script lang="ts">
  import { browser } from "$app/environment";
  import { page } from "$app/stores";

  import { onMount } from "svelte";
  import { embedUrl } from "$lib/api/embed";
  import * as documents from "$lib/api/documents";

  import DocumentLayout from "$lib/components/layouts/DocumentLayout.svelte";
  import GuidedTour from "$lib/components/onboarding/GuidedTour.svelte";
  import ViewerContext from "$lib/components/viewer/ViewerContext.svelte";

  export let data;

  $: document = data.document;
  $: mode = data.mode;
  $: text = browser
    ? documents.text(document)
    : Promise.resolve({ pages: [], updated: 0 });
  $: asset_url = data.asset_url;
  $: canonical_url = documents.canonicalUrl(document).href;

  $: hasDescription = Boolean(document.description?.trim().length);

  onMount(() => {
    // if we're in an iframe, redirect to the embed route
    const inIframe = window.self !== window.top;
    if (inIframe) {
      const embedUrl = documents.embedUrl(document, $page.url.searchParams);
      window.location.href = embedUrl.href;
    }
  });
</script>

<svelte:head>
  <!-- Insert canonical URL -->
  <link rel="canonical" href={canonical_url} />

  {#if document.noindex || document.admin_noindex}
    <meta name="robots" content="noindex" />
  {/if}
  <title>{document.title} | DocumentCloud</title>
  <link
    rel="alternate"
    type="application/json+oembed"
    href={embedUrl(document.canonical_url).href}
    title={document.title}
  />
  {#if hasDescription}
    <meta name="description" content={document.description} />
    <meta property="og:description" content={document.description} />
  {/if}
  <meta
    property="og:image"
    content={documents.pageImageUrl(document, 1, "normal").href}
  />
  <!-- Social cards -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="og:url" content={canonical_url} />
  <meta property="og:title" content={document.title} />

  <link
    rel="prefetch"
    href={asset_url.href}
    as="fetch"
    crossorigin="anonymous"
    type="application/pdf"
  />
</svelte:head>

<ViewerContext {document} {mode} {text} {asset_url}>
  <DocumentLayout />
</ViewerContext>
<GuidedTour />
