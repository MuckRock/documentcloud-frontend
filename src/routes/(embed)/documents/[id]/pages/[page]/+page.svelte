<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Annotation from "./Annotation.svelte";
  import Note from "./Note.svelte";

  import { pageSizesFromSpec } from "@/api/pageSize.js";
  import { APP_URL, IMAGE_WIDTHS_MAP } from "@/config/config.js";
  import { informSize } from "@/embed/iframeSizer.js";
  import {
    canonicalPageUrl,
    pageImageUrl,
    pageUrl,
    textUrl,
    userOrgString,
  } from "@/lib/api/documents";
  import { embedUrl } from "$lib/api/embed";

  export let data;

  const dispatch = createEventDispatcher();

  let elem;
  let active = null;

  $: doc = data.document;
  $: slugId = `${doc.id}-${doc.slug}`;
  $: notes = data.notes;
  $: page = +data.page;
  $: title = `${doc.title} (${$_("document.pageAbbrev")} ${data.page})`;
  $: url = canonicalPageUrl(doc, page).toString();
  $: sizes = pageSizesFromSpec(doc.page_spec);
  $: aspect = sizes[page - 1];
  $: width = IMAGE_WIDTHS_MAP.get("large");
  $: height = width * aspect;
  $: shimPlacements =
    active === null
      ? []
      : [
          [0, 0, 1, active.y1], // top
          [0, active.y1, active.x1, active.y2], // left
          [active.x2, active.y1, 1, active.y2], // right
          [0, active.y2, 1, 1], // bottom
        ];

  function onKeyup(e) {
    if (e.key === "Escape") {
      dispatch("close");
    }
  }
</script>

<svelte:head>
  <!-- Insert canonical URL -->
  <link rel="canonical" href={url} />

  <!-- Social cards -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="og:url" content={url} />
  <meta property="og:url" content={url} />
  <meta property="og:title" content={title} />
  <title>{title} - DocumentCloud</title>
  <link
    rel="alternate"
    type="application/json+oembed"
    href={embedUrl(url).toString()}
    {title}
  />
  {#if doc.description}
    <meta property="og:description" content={doc.description} />
  {/if}
  <meta
    property="og:image"
    content={pageImageUrl(doc, page, "normal").toString()}
  />
</svelte:head>

<svelte:window on:keydown={onKeyup} />

<div class="dc-embed">
  <div class="dc-page">
    Page
    {page}
    of
    <a
      class="DC-embed-resource"
      href={pageUrl(doc, page).toString()}
      title={$_("embedPage.viewDoc", { values: { title: doc.title } })}
      target="_blank"
    >
      {doc.title}
    </a>
  </div>

  <div class="dc-embed-container" class:active={Boolean(active)}>
    <img
      src={pageImageUrl(doc, page, "large").toString()}
      alt={$_("embedPage.pageOf", {
        values: { page: page, title: doc.title },
      })}
      width="{width}px"
      height="{height}px"
      on:load={(e) => informSize(elem)}
    />

    <!-- Place notes on image -->
    {#each notes as note}
      {#if active != note}
        <Note on:click={() => (active = note)} {note} />
      {/if}
    {/each}

    <!-- Place shims while note is active -->
    {#each shimPlacements as s}
      <div
        class="dc-embed-shim"
        on:click={() => (active = null)}
        style="left:{s[0] * 100}%;top:{s[1] * 100}%;right:{(1 - s[2]) *
          100}%;bottom:{(1 - s[3]) * 100}%"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        on:keydown={onKeyup}
      />
    {/each}

    <!-- Show annotation if note is active -->
    {#if active}
      <Annotation
        note={active}
        {slugId}
        {page}
        on:close={(e) => (active = null)}
      />
      <Note active={true} note={active} />
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
    {userOrgString(doc)}
    &bull;
    <a
      style="color: #5a76a0; text-decoration: underline;"
      href={pageUrl(doc, page).toString()}
      title={$_("embedPage.viewDoc", { values: { title: doc.title } })}
      target="_blank"
    >
      View document
    </a>
    or
    <a
      style="color: #5a76a0; text-decoration: underline;"
      href={textUrl(doc, page - 1).toString()}
      title="Read the text of page {page} of {doc.title} on DocumentCloud in
      new window or tab"
      target="_blank"
    >
      read text
    </a>
  </div>
</div>

<style>
  .dc-embed {
    font-size: 10pt;
    max-width: 600px;
    background: rgb(244, 244, 244);
    padding: 18px 20px;
    box-sizing: border-box;
    border: solid 1px gainsboro;
    border-radius: var(--radius);
  }

  .dc-embed a {
    color: #5a76a0;
    text-decoration: underline;
  }

  .dc-embed :global(img) {
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
    background: rgba(0, 0, 0, 0.25);
    cursor: pointer;
  }
</style>
