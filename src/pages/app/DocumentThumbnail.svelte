<script>
  import Link from "@/router/Link";
  import Image from "@/common/Image";
  import Loader from "@/common/Loader";
  import Tooltip from "@/common/Tooltip";

  // SVG assets
  import errorIconSvg from "@/assets/error_icon.svg";

  export let document;
</script>

<style lang="scss">
  .img {
    padding: 0 35px 20px 35px;
    display: table-cell;
    vertical-align: top;

    @media only screen and (max-width: $mobileBreak) {
      padding: 10px 15px 20px 15px;
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

<div class="img">
  <span class="imgwrap">
    {#if document.viewable}
      <Link to="viewer" params={{ id: document.slugId }}>
        <Image src={document.thumbnail} />
      </Link>
    {:else if document.pending}
      <Tooltip>
        <div slot="caption" class="caption">
          {#if document.realProgress != null}
            <p>{Math.floor(document.realProgress * 100)}%</p>
            {#if document.imagesProcessed != null && document.textsProcessed != null}
              <p>{document.imagesProcessed} / {document.pageCount} images</p>
              <p>{document.textsProcessed} / {document.pageCount} texts</p>
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
