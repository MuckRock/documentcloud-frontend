<script>
  import Checkbox from "@/common/Checkbox";
  import Button from "@/common/Button";
  import Tooltip from "@/common/Tooltip";
  import Image from "@/common/Image";
  import Link from "@/router/Link";
  import DocumentThumbnail from "./DocumentThumbnail";

  // Stores
  import { layout, unselectDocument, openAccess } from "@/manager/layout";
  import { removeDocument, selectDocument } from "@/manager/documents";
  import { projects } from "@/manager/projects";

  // SVG assets
  import privateIconSvg from "@/assets/private_icon.svg";
  import publicIconSvg from "@/assets/public_icon.svg";
  import organizationIconSvg from "@/assets/organization_icon.svg";
  import closeSimpleSvg from "@/assets/close_inline.svg";

  import { pageImageUrl } from "@/api/viewer";

  export let document;

  $: highlightsActive =
    document.highlights != null && document.highlights.length > 0;
  $: trimmedHighlights = highlightsActive
    ? document.highlights.slice(0, 3)
    : null;

  let expandHighlights = false;
  let closeHighlights = false;

  $: moreToExpand = highlightsActive
    ? !expandHighlights &&
      trimmedHighlights.length != document.highlights.length
    : false;

  $: highlights = highlightsActive
    ? expandHighlights
      ? document.highlights
      : trimmedHighlights
    : null;

  $: documentAccessString = document.organizationAccess
    ? "Only members of your organization can view this document"
    : document.publicAccess
    ? "Anyone can search and view this document"
    : "Only you can view this document";

  let shiftKey = false;

  function handleKeydown(e) {
    if (e.key == "Shift") shiftKey = true;
  }

  function handleKeyup(e) {
    if (e.key == "Shift") shiftKey = false;
  }
</script>

<style lang="scss">
  h2 {
    font-size: $normal;
    padding-top: 10px;
    padding-bottom: 6px;
    word-break: break-word;
    margin: 2px 0;
    padding: 0;
  }

  h3 {
    font-size: $small;
    font-weight: normal;
    color: $gray;
    margin: 2px 0;
    padding: 0;
  }

  .card {
    display: table;

    .row {
      display: table-row;

      > * {
        display: table-cell;
        vertical-align: top;
      }
    }
  }

  .check {
    padding-top: 30px;
    padding-left: 30px;
  }

  .access {
    @include buttonLike;

    margin-left: 8px;
    vertical-align: middle;
  }

  .valign {
    vertical-align: middle;
    display: inline-block;
  }

  .actions {
    font-size: 14px;

    span {
      display: inline-block;
      margin: 6px 0;

      &.pending {
        color: $gray;
        font-style: italic;
      }

      &.error {
        color: $caution;
      }
    }
  }

  .hinfo {
    font-size: 13px;
    font-weight: bold;
    margin: 15px 0;

    > * {
      display: inline-block;
      vertical-align: middle;
    }

    .x {
      @include buttonLike;

      padding-right: 5px;
      height: 14px;

      :global(svg) {
        height: 12px;
        opacity: 0.7;
      }
    }

    .padleft {
      padding-left: 5px;
    }
  }

  .highlights {
    color: #333;
    font-size: 14px;
    line-height: 18px;
    display: table;
    width: 100%;
    padding-bottom: 27px;

    .row {
      display: table-row;

      > * {
        display: table-cell;
        vertical-align: top;
      }
    }

    .page {
      text-align: center;

      :global(img) {
        width: 40px;
        height: 52px;
        box-sizing: border-box;
        border: solid 1px gainsboro;
      }

      .number {
        font-weight: bold;
        font-size: 11px;
        padding-bottom: 15px;
      }
    }

    .highlight {
      width: 100%;
      padding-top: 8px;
      padding-left: 15px;
      padding-bottom: 15px;

      .passage {
        &.highlighted {
          background: $annotationBorder;
        }
      }
    }
  }
</style>

<div class="card">
  <div class="row">
    <div class="check">
      <Checkbox
        on:check={() => selectDocument(document, shiftKey)}
        on:uncheck={() => unselectDocument(document)}
        checked={$layout.selectedMap[document.id] != null} />
    </div>
    <DocumentThumbnail {document} />

    <div class="info">
      <h2>
        <span class="valign">{document.title}</span>
        <span class="valign">
          <Tooltip caption={documentAccessString}>
            <span class="access" on:click={openAccess([document])}>
              {#if document.privateAccess}
                {@html privateIconSvg}
              {:else if document.publicAccess}
                {@html publicIconSvg}
              {:else if document.organizationAccess}
                {@html organizationIconSvg}
              {/if}
            </span>
          </Tooltip>
        </span>
      </h2>
      <h3>{document.summary}</h3>
      <div class="actions">
        {#if document.status == 'success'}
          <Link to="viewer" params={{ id: document.id }}>
            <Button action={true}>Open</Button>
          </Link>
          {#if document.projectIds != null}
            {#each document.projectIds as id}
              {#if $projects.projectsById[id] != null}
                <Button plain={true}>{$projects.projectsById[id].title}</Button>
              {/if}
            {/each}
          {/if}
        {:else if document.status == 'pending'}
          <span class="pending">Processing</span>
        {:else if document.status == 'error'}
          <span class="error">
            An error occurred trying to process your document
            <br />
            <Button
              small={true}
              secondary={true}
              on:click={removeDocument(document)}>
              Remove
            </Button>
          </span>
        {:else if document.status == 'nofile'}
          <span class="error">Your document was uploaded improperly</span>
          <br />
          <Button
            small={true}
            secondary={true}
            on:click={removeDocument(document)}>
            Remove
          </Button>
        {/if}
      </div>
      {#if document.highlights != null && document.highlights.length > 0 && !closeHighlights}
        <div class="hinfo">
          <span class="x" on:click={() => (closeHighlights = true)}>
            {@html closeSimpleSvg}
          </span>

          {#if moreToExpand}
            <span>
              {highlights.length} of {document.highlights.length} pages matching
              the query
            </span>
            <span class="padleft">
              <Button action={true} on:click={() => (expandHighlights = true)}>
                Show all
              </Button>
            </span>
          {:else}
            <span>{document.highlights.length} pages matching the query</span>
          {/if}
        </div>
        <div class="highlights">
          {#each highlights as highlight}
            <div class="row">
              <div class="page">
                <Image
                  fade={false}
                  src={pageImageUrl(document, highlight.page, 40)} />
                <div class="number">p. {highlight.page + 1}</div>
              </div>
              <div class="highlight">
                {#each highlight.passages as passage}
                  {#if passage.type == 'highlight'}
                    <span class="passage highlighted">{passage.text}</span>
                  {:else}
                    <span class="passage">{passage.text}</span>
                  {/if}
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />
