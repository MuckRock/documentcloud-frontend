<script>
  import { _ } from "svelte-i18n";
  import { createEventDispatcher } from "svelte";

  import Image from "@/common/Image.svelte";
  import Loader from "@/common/Loader.svelte";
  import Tooltip from "$lib/components/common/Tooltip.svelte";

  // SVG assets
  import errorIconSvg from "@/assets/error_icon.svg?raw";
  import publicTagSvg from "@/assets/public_tag.svg?raw";
  import organizationTagSvg from "@/assets/organization_tag.svg?raw";
  import privateTagSvg from "@/assets/private_tag.svg?raw";

  export let document;
  export let embed = false;
  export let dialog = false;
  export let noteCount = 0;
  export let publicNote = false;
  export let orgNote = false;
  export let privateNote = false;
  export let progress = null;
  export let processed = null;
  export let pageCount = null;

  const dispatch = createEventDispatcher();
</script>

<div class="img" data-id={document.id} class:embed>
  <span class="imgwrap">
    {#if document.viewable}
      {#if dialog}
        <Image
          clickable={true}
          on:click={() => dispatch("pick", document)}
          src={document.thumbnail}
        />
      {:else if embed && document.publishedUrl != null && document.publishedUrl.trim().length > 0}
        <a href={document.publishedUrl} rel="noreferrer" target="_blank"
          ><Image src={document.thumbnail} /></a
        >
      {:else}
        <a
          href={document.canonicalUrl}
          target={embed ? "_blank" : null}
          rel={embed ? "noopener noreferrer" : null}
        >
          <Image src={document.thumbnail} />
        </a>
      {/if}
    {:else if document.pending}
      <Tooltip>
        <div slot="caption" class="caption">
          {#if progress != null}
            <p>{Math.floor(progress * 100)}%</p>
            {#if processed != null}
              <p>
                {processed} / {pageCount}
                {$_("documentThumbnail.pages")}
              </p>
            {/if}
          {:else}{$_("documentThumbnail.loading")}{/if}
        </div>
        <Loader active={true} center={true} big={true}>
          <span class="fullstatus">{document.status}</span>
        </Loader>
      </Tooltip>
    {:else}
      <span class="error">
        {@html errorIconSvg}
      </span>
    {/if}
  </span>
  {#if noteCount > 0}
    <span class="note-count">
      {$_("document.noteCount", { values: { n: noteCount } })}
    </span>
    <div class="tag">
      {#if publicNote}
        {@html publicTagSvg}
      {/if}
      {#if orgNote}
        {@html organizationTagSvg}
      {/if}
      {#if privateNote}
        {@html privateTagSvg}
      {/if}
    </div>
  {/if}
</div>

<style>
  .img {
    padding: 0 35px 20px 35px;
    display: table-cell;
    vertical-align: top;
    position: relative;
  }

  @media only screen and (max-width: 720px) {
    .img {
      padding: 0 15px 20px 15px;
    }
  }

  .img :global(img),
  .img > *,
  .img .fullstatus {
    width: 70px;
    height: 88px;
    display: table-cell;
    text-align: center;
    vertical-align: middle;
    object-fit: contain;
  }

  @media only screen and (max-width: 720px) {
    .img :global(img),
    .img > *,
    .img .fullstatus {
      width: 43px;
      height: 54px;
      font-size: 12px;
    }
  }

  .img.embed {
    padding: 5px 15px 10px 15px;
  }

  .img.embed :global(img),
  .img.embed > *,
  .img.embed .fullstatus {
    width: 43px;
    height: 54px;
    font-size: 12px;
  }

  .img .error {
    background: #fffafa;
  }

  .img .imgwrap {
    background: white;
    outline: var(--normaloutline);
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.12);
  }

  .img .caption {
    text-align: left;
  }
  .img .caption p {
    margin: 5px 0;
  }

  .img .note-count {
    display: inline-block;
    font-size: var(--small);
    font-weight: normal;
    color: var(--gray);
    margin: 2px 0;
    padding: 0;
    height: inherit;
  }

  .img .tag {
    position: absolute;
    top: 13px;
    left: 19px;
    opacity: 0.5;
    z-index: var(--viewerTagZ);
    width: inherit;
    height: inherit;
  }

  .img .tag:hover {
    opacity: 0.8;
  }

  .img .tag :global(svg) {
    height: 12px;
    display: block;
  }
</style>
