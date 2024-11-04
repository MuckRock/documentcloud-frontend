<!-- @component
  Assumes it's a child of a ViewerContext
 -->

<script lang="ts">
  import "@/style/kit.css";

  import { embedUrl } from "$lib/api/embed";
  import { canonicalUrl, pageImageUrl } from "$lib/api/documents";

  import DocumentLayout from "$lib/components/layouts/DocumentLayout.svelte";
  import GuidedTour from "$lib/components/onboarding/GuidedTour.svelte";
  import ViewerContext from "$lib/components/viewer/ViewerContext.svelte";

  export let data;

  $: document = data.document;
  $: mode = data.mode;
  $: text = data.text;
  $: asset_url = data.asset_url;
  $: canonical_url = canonicalUrl(document).href;

  $: action = data.action;
  $: addons = data.pinnedAddons;
  $: hasDescription = Boolean(document.description?.trim().length);
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
    content={pageImageUrl(document, 0, "normal").href}
  />
  <!-- Social cards -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="og:url" content={canonical_url} />
  <meta property="og:title" content={document.title} />
</svelte:head>

<ViewerContext {document} {mode} {text} {asset_url}>
  <DocumentLayout {action} {addons} />
</ViewerContext>
<GuidedTour />
