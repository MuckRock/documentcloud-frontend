<script>
  import { onMount, tick } from "svelte";
  import { _ } from "svelte-i18n";

  import Note from "./Note.svelte";
  import Annotation from "./Annotation.svelte";
  import ProgressiveImage from "@/common/ProgressiveImage.svelte";

  import { informSize } from "@/embed/iframeSizer.js";
  import { getDocument } from "@/api/document.js";
  import { getAnnotations } from "@/api/annotation.js";
  import { textUrl, pageImageUrl } from "@/api/viewer.js";
  import { embedUrl } from "@/api/embed.js";

  import { APP_URL, DC_BASE } from "../../../config/config.js";

  export let id;
  export let page;
  let elem;
  let doc = null;
  let notes = [];
  let active = null;

  $: idPart = id.split("-")[0];
  $: pageUrl = doc == null ? "" : doc.pageUrl(page);
  $: canonicalPageUrl = doc == null ? "" : doc.canonicalPageUrl(page);
  $: title =
    doc == null ? "" : `${doc.title} (${$_("document.pageAbbrev")} ${page})`;
  $: aspect = doc == null ? 1 : doc.pageSizes[page - 1];

  $: shimPlacements =
    active == null
      ? []
      : [
          [0, 0, 1, active.y1], // top
          [0, active.y1, active.x1, active.y2], // left
          [active.x2, active.y1, 1, active.y2], // right
          [0, active.y2, 1, 1], // bottom
        ];

  const isPageResourcePath = /\/documents\/[0-9]+\/pages\/.*\.(txt|gif)$/;

  onMount(async () => {
    const pageResourcePath = isPageResourcePath.exec(window.location.pathname);
    if (pageResourcePath != null) {
      const pageResourceUrl = DC_BASE + "/files" + window.location.pathname;
      window.location.href = pageResourceUrl;
      return;
    }

    doc = await getDocument(idPart);
    // TODO: get for specific page
    notes = (await getAnnotations(idPart, "")).filter(
      (note) => !note.isPageNote && note.page == page - 1,
    );

    // Render content
    await tick();

    // Inform iframe of size updates
    informSize(elem);
  });

  function handleClick(note) {
    if (active == note) {
      active = null;
      return;
    }
    if (active != null) return;
    active = note;
  }
</script>

<svelte:head>
  {#if doc != null && canonicalPageUrl != "" && title != ""}
    <!-- Insert canonical URL -->
    <link rel="canonical" href={canonicalPageUrl} />

    <!-- Social cards -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="og:url" content={canonicalPageUrl} />
    <meta property="og:url" content={canonicalPageUrl} />
    <meta property="og:title" content={title} />
    <title>{title} - DocumentCloud</title>
    <link
      rel="alternate"
      type="application/json+oembed"
      href={embedUrl(canonicalPageUrl)}
      {title}
    />
    {#if doc.description != null && doc.description.trim().length > 0}
      <meta property="og:description" content={doc.description} />
    {/if}
    <meta property="og:image" content={pageImageUrl(doc, page - 1, 700, 1)} />
  {/if}
</svelte:head>

<div class="dc-embed" bind:this={elem}>
  {#if doc != null}
    <div class="dc-page">
      Page
      {page}
      of
      <a
        class="DC-embed-resource"
        href={pageUrl}
        title={$_("embedPage.viewDoc", { values: { title: doc.title } })}
        target="_blank"
      >
        {doc.title}
      </a>
    </div>
    <div class="dc-embed-container">
      <ProgressiveImage
        width={600}
        {aspect}
        on:load={() => informSize(elem)}
        bordered={false}
        alt={$_("embedPage.pageOf", {
          values: { page: page, title: doc.title },
        })}
        page={{ document: doc, pageNumber: page - 1 }}
      />

      <!-- Place notes on image -->
      {#each notes as note}
        {#if active != note}
          <Note on:click={() => handleClick(note)} {note} />
        {/if}
      {/each}

      <!-- Place shims while note is active -->
      {#each shimPlacements as s}
        <div
          class="dc-embed-shim"
          on:click={() => (active = null)}
          style="left:{s[0] * 100}%;top:{s[1] * 100}%;right:{(1 - s[2]) *
            100}%;bottom:{(1 - s[3]) * 100}%"
        />
      {/each}

      <!-- Show annotation if note is active -->
      {#if active != null}
        <Annotation note={active} slugId={id} {page} />
        <Note
          active={true}
          on:click={() => handleClick(active)}
          note={active}
        />
      {/if}
    </div>
    <div style="font-size:14px;line-height:18px;text-align:center">
      Contributed to
      <a
        href={APP_URL}
        title={$_("embedPage.gotoDocCloud")}
        target="_blank"
        style="color: #5a76a0; text-decoration: underline;
        font-weight:700;font-family:Gotham,inherit,sans-serif;color:inherit;text-decoration:none"
      >
        DocumentCloud
      </a>
      by
      {doc.userOrgString}
      &bull;
      <a
        style="color: #5a76a0; text-decoration: underline;"
        href={pageUrl}
        title={$_("embedPage.viewDoc", { values: { title: doc.title } })}
        target="_blank"
      >
        View document
      </a>
      or
      <a
        style="color: #5a76a0; text-decoration: underline;"
        href={textUrl(doc, page - 1)}
        title="Read the text of page {page} of {doc.title} on DocumentCloud in
        new window or tab"
        target="_blank"
      >
        read text
      </a>
    </div>
  {/if}
</div>

<style lang="scss">
  .dc-embed {
    font-size: 10pt;
    max-width: 600px;
    background: rgb(244, 244, 244);
    padding: 18px 20px;
    box-sizing: border-box;
    border: solid 1px gainsboro;
    border-radius: $radius;

    a {
      color: #5a76a0;
      text-decoration: underline;
    }

    :global(img) {
      max-width: 100%;
      height: auto;
      margin: 0;
      border: 1px solid #ccc;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      clear: both;
    }

    .dc-page {
      font-size: 14px;
      line-height: 18px;
    }

    .dc-embed-container {
      position: relative;
      line-height: 0;
      margin: 10px 0;
    }

    .dc-embed-shim {
      position: absolute;
      background: rgba(0, 0, 0, 0.4);
      cursor: pointer;
    }
  }
</style>
