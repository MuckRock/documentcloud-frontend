<script>
  import { _ } from "svelte-i18n";

  import { pageSizesFromSpec } from "@/api/pageSize.js";
  import { APP_URL, IMAGE_WIDTHS_MAP } from "@/config/config.js";
  import { informSize } from "@/embed/iframeSizer.js";
  import {
    canonicalPageUrl,
    pageImageUrl,
    pageUrl,
    textUrl,
  } from "$lib/api/documents.js";
  import { embedUrl } from "$lib/api/embed.js";

  export let data;

  let elem;

  $: doc = data.document;
  $: page = data.page;
  $: title = `${doc.title} (${$_("document.pageAbbrev")} ${data.page})`;
  $: url = canonicalPageUrl(doc, data.page);
  $: userOrgString = doc.organization
    ? `${doc.user.name} (${doc.organization.name})`
    : doc.user.name;
  $: sizes = pageSizesFromSpec(doc.page_spec);
  $: aspect = sizes[page - 1];
  $: width = IMAGE_WIDTHS_MAP.get("large");
  $: height = width * aspect;
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
    href={embedUrl(url)}
    {title}
  />
  {#if doc.description}
    <meta property="og:description" content={doc.description} />
  {/if}
  <meta property="og:image" content={pageImageUrl(doc, page, "normal")} />
</svelte:head>

<div class="dc-embed">
  <div class="dc-page">
    Page
    {page}
    of
    <a
      class="DC-embed-resource"
      href={pageUrl(doc, page)}
      title={$_("embedPage.viewDoc", { values: { title: doc.title } })}
      target="_blank"
    >
      {doc.title}
    </a>
  </div>

  <div class="dc-embed-container">
    <img
      src={pageImageUrl(doc, page, "large")}
      alt={$_("embedPage.pageOf", {
        values: { page: page, title: doc.title },
      })}
      width="{width}px"
      height="{height}px"
      on:load={(e) => informSize(elem)}
    />
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
    {userOrgString}
    &bull;
    <a
      style="color: #5a76a0; text-decoration: underline;"
      href={pageUrl(doc, page)}
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
</style>
