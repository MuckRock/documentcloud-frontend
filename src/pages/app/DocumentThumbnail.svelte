<script>
  import Link from "@/router/Link";
  import Image from "@/common/Image";
  import Loader from "@/common/Loader";
  import Tooltip from "@/common/Tooltip";
  import { documents } from "@/manager/documents";

  // SVG assets
  import errorIconSvg from "@/assets/error_icon.svg";

  export let document;
  export let embed = false;

  $: realProgress =
    document == null ? null : $documents.realProgressMap[document.id];
  $: imagesProcessed =
    document == null ? null : $documents.imagesProcessedMap[document.id];
  $: textsProcessed =
    document == null ? null : $documents.textsProcessedMap[document.id];
  $: pageCount = document == null ? null : $documents.pageCountMap[document.id];
</script>

<style lang="scss">
  .img {
    padding: 0 35px 20px 35px;
    display: table-cell;
    vertical-align: top;

    @media only screen and (max-width: $mobileBreak) {
      padding: 10px 15px 20px 15px;
    }

    &.embed {
      padding: 5px 15px 10px 15px;
    }

    :global(img),
    > *,
    .fullstatus {
      width: 70px;
      height: 88px;
      display: table-cell;
      text-align: center;
      vertical-align: middle;
      object-fit: contain;

      @media only screen and (max-width: $mobileBreak) {
        width: 43px;
        height: 54px;
        font-size: 12px;
      }
    }

    .error {
      background: #fffafa;
    }

    .imgwrap {
      background: white;
      outline: $normaloutline;
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.12);
    }

    .caption {
      text-align: left;

      p {
        margin: 5px 0;
      }
    }
  }
</style>

<div class="img" class:embed>
  <span class="imgwrap">
    {#if document.viewable}
      {#if embed && document.publishedUrl != null}
        <a href={document.publishedUrl} rel="noreferrer" target="_blank"
          ><Image src={document.thumbnail} /></a
        >
      {:else}
        <Link newPage={embed} to="viewer" params={{ id: document.slugId }}>
          <Image src={document.thumbnail} />
        </Link>
      {/if}
    {:else if document.pending}
      <Tooltip>
        <div slot="caption" class="caption">
          {#if realProgress != null}
            <p>{Math.floor(realProgress * 100)}%</p>
            {#if imagesProcessed != null && textsProcessed != null}
              <p>{imagesProcessed} / {pageCount} images</p>
              <p>{textsProcessed} / {pageCount} texts</p>
            {/if}
          {:else}Loading progress information...{/if}
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
</div>
