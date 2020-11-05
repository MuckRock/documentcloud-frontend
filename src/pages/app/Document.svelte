<script>
  import Checkbox from "@/common/Checkbox";
  import Button from "@/common/Button";
  import Tooltip from "@/common/Tooltip";
  import Image from "@/common/Image";
  import Progress from "@/common/Progress";
  import HtmlField from "@/common/HtmlField";
  import Link from "@/router/Link";
  import DocumentThumbnail from "./DocumentThumbnail";

  // Stores
  import {
    layout,
    unselectDocument,
    openAccess,
    editData,
  } from "@/manager/layout";
  import { removeDocument, selectDocument } from "@/manager/documents";
  import { projects } from "@/manager/projects";
  import { projectUrl, dataUrl } from "@/search/search";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";

  // SVG assets
  import privateIconSvg from "@/assets/private_icon.svg";
  import publicIconSvg from "@/assets/public_icon.svg";
  import organizationIconSvg from "@/assets/organization_icon.svg";
  import closeSimpleSvg from "@/assets/close_inline.svg";
  import pencilSvg from "@/assets/pencil.svg";

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

  const TAG_KEY = process.env.TAG_KEY;
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

    @media only screen and (max-width: $mobileBreak) {
      margin-bottom: 20px;
    }

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
    &.selectable {
      @include buttonLike;
    }

    margin-left: 8px;
    vertical-align: middle;
  }

  .updating {
    color: $gray;
    margin-bottom: 26px;
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

  .smallinfo {
    font-size: 12px;
    color: $gray;
    display: inline-block;
    margin-right: 2px;
    font-style: italic;
  }

  .pencil {
    @include buttonLike;
    vertical-align: middle;
    height: 10px;
  }

  .description {
    margin: 8px 0 -8px 0;
  }
</style>

<div class="card">
  <div class="row">
    {#if $orgsAndUsers.loggedIn}
      <div class="check">
        <Checkbox
          on:check={() => selectDocument(document, shiftKey)}
          on:uncheck={() => unselectDocument(document)}
          checked={$layout.selectedMap[document.id] != null} />
      </div>
    {/if}
    <DocumentThumbnail {document} />

    <div class="info">
      <h2>
        <span class="valign">{document.title}</span>
        <span class="valign">
          <Tooltip caption={documentAccessString}>
            <span
              class="access"
              class:selectable={document.editAccess}
              on:click={openAccess([document])}>
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
      {#if document.description != null && document.description.trim().length > 0}
        <div class="description">
          <HtmlField content={document.description} />
        </div>
      {/if}
      <div class="actions">
        {#if document.viewable}
          <Link to="viewer" params={{ id: document.slugId }}>
            <Button action={true}>Open</Button>
          </Link>
          {#if document.readable}
            <div class="updating">
              Updating document...
              <Progress initializing={true} progress={0} compact={true} />
            </div>
          {/if}
        {:else if document.pending}
          <span class="pending">Processing</span>
        {:else if document.error}
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
        {:else if document.nofile}
          <span class="error">Your document was uploaded improperly</span>
          <br />
          <Button
            small={true}
            secondary={true}
            on:click={removeDocument(document)}>
            Remove
          </Button>
        {/if}
        <!-- Show project and data tags -->
        {#if document.projectIds != null}
          {#each document.projectIds as id}
            {#if $projects.projectsById[id] != null}
              <Link toUrl={projectUrl($projects.projectsById[id])}>
                <Button plain={true}>
                  <div class="smallinfo">Project</div>
                  {$projects.projectsById[id].title}
                </Button>
              </Link>
            {/if}
          {/each}
          {#each document.dataPoints as { key, value }}
            <Link toUrl={dataUrl(key, value)}>
              <Button plain={true}>
                {#if key != TAG_KEY}{key}:{/if}
                {value}
              </Button>
            </Link>
          {/each}
          {#if document.dataPoints.length > 0 && document.editAccess}
            <span class="pencil" on:click={() => editData([document])}>
              {@html pencilSvg}
            </span>
          {/if}
        {/if}
      </div>
      {#if document.highlights != null && document.highlights.length > 0 && !closeHighlights}
        <div class="hinfo">
          <span class="x" on:click={() => (closeHighlights = true)}>
            {@html closeSimpleSvg}
          </span>

          {#if moreToExpand}
            <span>
              {highlights.length}
              of
              {document.highlights.length}
              pages matching the query
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
              {#each highlight.passages as passage}
                <div class="highlight">
                  {#each passage as term}
                    {#if term.type == 'highlight'}
                      <span class="passage highlighted">{term.text}</span>
                    {:else}<span class="passage">{term.text}</span>{/if}
                  {/each}
                </div>
              {/each}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />
