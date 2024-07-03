<script lang="ts">
  import "@/style/kit.css";

  import type { Document, Project, ViewerMode } from "$lib/api/types";

  import { page } from "$app/stores";

  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";

  import MainLayout from "$lib/components/layouts/MainLayout.svelte";

  // sidebars
  import DocumentMetadata from "./sidebar/DocumentMetadata.svelte";
  import Actions from "./sidebar/Actions.svelte";
  import AddOns from "@/routes/app/sidebar/AddOns.svelte";
  import Data from "./sidebar/Data.svelte";
  import Projects from "./sidebar/Projects.svelte";
  import Sections from "./sidebar/Sections.svelte";
  import Notes from "./sidebar/Notes.svelte";

  import { embedUrl } from "$lib/api/embed";
  import { canonicalUrl, pageImageUrl } from "@/lib/api/documents";

  export let data;

  const mode: Writable<ViewerMode> = writable($page.data.mode);

  setContext<Document>("document", data.document);
  setContext("mode", mode);

  $: $mode = $page.data.mode;
  $: document = data.document;
  $: projects = document.projects as Project[];
  $: canonical_url = canonicalUrl(document).href;
</script>

<svelte:head>
  <!-- Insert canonical URL -->
  <link rel="canonical" href={canonical_url} />

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
    href={embedUrl(document.canonical_url).href}
    title={document.title}
  />
  {#if document?.description?.trim().length > 0}
    <meta property="og:description" content={document.description} />
  {/if}
  <meta
    property="og:image"
    content={pageImageUrl(document, 0, "normal").href}
  />
</svelte:head>

<MainLayout>
  <svelte:fragment slot="navigation">
    <DocumentMetadata {document} />

    <Notes {document} />

    <Sections {document} mode={$mode} />

    <Data {document} />

    <Projects {projects} />
  </svelte:fragment>

  <slot slot="content" />

  <svelte:fragment slot="action">
    <Actions {document} />

    {#if document.edit_access}
      <AddOns pinnedAddOns={data.pinnedAddons} />
    {/if}
  </svelte:fragment>
</MainLayout>
