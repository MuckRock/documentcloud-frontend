<script>
  import Checkbox from "@/common/Checkbox";
  import Button from "@/common/Button";
  import AccessIcon from "@/common/AccessIcon";
  import Image from "@/common/Image";
  import Progress from "@/common/Progress";
  import HtmlField from "@/common/HtmlField";
  import Link from "@/router/Link";
  import DocumentThumbnail from "./DocumentThumbnail";
  import Annotation from "@/pages/viewer/Annotation";
  import { _, date } from "svelte-i18n";

  // Stores
  import { layout, unselectDocument, editData } from "@/manager/layout";
  import { removeDocument, selectDocument } from "@/manager/documents";
  import { projects } from "@/manager/projects";
  import { projectUrl, dataUrl } from "@/search/search";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";

  import closeSimpleSvg from "@/assets/close_inline.svg";
  import pencilSvg from "@/assets/pencil.svg";

  import { pageImageUrl } from "@/api/viewer";

  export let document;
  export let embed = false;
  export let dialog = false;

  $: highlightsActive =
    document.highlights != null && document.highlights.length > 0;
  $: trimmedHighlights = highlightsActive
    ? document.highlights.slice(0, 3)
    : null;

  let expandHighlights = false;
  let closeHighlights = false;
  let closeNoteHighlights = false;

  $: moreToExpand = highlightsActive
    ? !expandHighlights &&
      trimmedHighlights.length != document.highlights.length
    : false;

  $: highlights = highlightsActive
    ? expandHighlights
      ? document.highlights
      : trimmedHighlights
    : null;

  $: noteHighlights = document.noteHighlights;

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

    @media only screen and (max-width: 720px) {
      margin-bottom: 15px;
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

  .updating {
    color: $gray;
    margin-bottom: 26px;
  }

  .valign {
    vertical-align: middle;
    display: inline-block;

    &.marginleft {
      margin-left: 8px;
    }
  }

  .actions {
    font-size: 14px;
    padding-bottom: 10px;

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
      @include buttonLike;
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

  .note-highlights {
    position: relative;
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

    &.embeddescription {
      margin-bottom: 20px;

      :global(.content) {
        max-height: 135px;
      }
    }
  }
</style>

<div class="card">
  <div class="row">
    {#if $orgsAndUsers.loggedIn && !embed && !dialog}
      <div class="check">
        <Checkbox
          on:check={() => selectDocument(document, shiftKey)}
          on:uncheck={() => unselectDocument(document)}
          checked={$layout.selectedMap[document.id] != null}
        />
      </div>
    {/if}
    <DocumentThumbnail
      {embed}
      {dialog}
      {document}
      on:pick
      noteCount={document.notes.length}
      publicNote={document.notes.some((x) => x.access == "public")}
      orgNote={document.notes.some((x) => x.access == "organization")}
      privateNote={document.notes.some((x) => x.access == "private")}
    />

    <div class="info">
      <h2>
        <span class="valign">{document.title}</span>
        {#if !embed}
          <span class="valign marginleft">
            <AccessIcon {document} />
          </span>
        {/if}
      </h2>
      {#if !embed}
        <h3>
          {#if document.pageCount > 0}
            {$_("document.pageCount", { values: { n: document.pageCount } })} -
          {/if}
          {#if document.source != null && document.source.trim().length > 0}
            {$_("document.source")}: {document.source} -
          {/if}
          {#if document.userName !== null}
            {document.userOrgString} -
          {/if}
          {$date(document.createdAt, { format: "medium" })}
        </h3>
      {/if}
      {#if document.description != null && document.description.trim().length > 0}
        <div class="description" class:embeddescription={embed}>
          <HtmlField content={document.description} />
        </div>
      {/if}
      {#if !embed}
        <div class="actions">
          {#if document.viewable}
            <Link to="viewer" params={{ id: document.slugId }}>
              <Button action={true}>{$_("document.open")}</Button>
            </Link>
            {#if document.readable}
              <div class="updating">
                {$_("document.updating")}
                <Progress initializing={true} progress={0} compact={true} />
              </div>
            {/if}
          {:else if document.pending}
            <span class="pending">{$_("document.processing")}</span>
          {:else if document.error}
            <span class="error">
              {$_("document.processingError")}
              <br />
              <Button
                small={true}
                secondary={true}
                on:click={removeDocument(document)}
                >{$_("document.remove")}</Button
              >
            </span>
          {:else if document.nofile}
            <span class="error">{$_("document.improper")}</span>
            <br />
            <Button
              small={true}
              secondary={true}
              on:click={removeDocument(document)}
              >{$_("document.remove")}</Button
            >
          {/if}
          <!-- Show project and data tags -->
          {#if document.projectIds != null}
            {#each document.projectIds as id}
              {#if $projects.projectsById[id] != null}
                <Link toUrl={projectUrl($projects.projectsById[id])}>
                  <Button plain={true}>
                    <div class="smallinfo">{$_("document.project")}</div>
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
                {$_("document.totalMatchingPages", {
                  values: {
                    n: highlights.length,
                    m: document.highlights.length,
                  },
                })}
              </span>
              <span class="padleft" on:click={() => (expandHighlights = true)}>
                {$_("document.showAll")}
              </span>
            {:else}
              <span>
                {$_("document.matchingPages", {
                  values: { n: document.highlights.length },
                })}
              </span>
            {/if}
          </div>

          <div class="highlights">
            {#each highlights as highlight}
              <div>
                <Link
                  inlineBlock={true}
                  toUrl={document.relativePageUrl(highlight.page + 1)}
                >
                  <div class="row">
                    <div class="page">
                      <Image
                        fade={false}
                        src={pageImageUrl(document, highlight.page, 40)}
                      />
                      <div class="number">
                        {$_("document.pageAbbrev")}
                        {highlight.page + 1}
                      </div>
                    </div>
                    {#each highlight.passages as passage}
                      <div class="highlight">
                        {#each passage as term}
                          {#if term.type == "highlight"}
                            <span class="passage highlighted">{term.text}</span>
                          {:else}
                            <span class="passage">{term.text}</span>
                          {/if}
                        {/each}
                      </div>
                    {/each}
                  </div>
                </Link>
              </div>
            {/each}
          </div>
        {/if}

        {#if document.noteHighlights != null && document.noteHighlights.length > 0 && !closeNoteHighlights}
          <div class="hinfo">
            <span class="x" on:click={() => (closeNoteHighlights = true)}>
              {@html closeSimpleSvg}
            </span>

            <span>Notes matching the query</span>
          </div>

          <div class="highlights note-highlights">
            {#each noteHighlights as highlight}
              <div>
                <Link toUrl={document.relativeNoteUrl(highlight.note)}>
                  <!-- to get correct aspect ratio we would need to store the page spec
                  in solr
                  --->
                  <Annotation
                    page={{
                      aspect: 11 / 8.5,
                      pageNumber: highlight.note.page,
                      document: document,
                    }}
                    pageNote={true}
                    mode="view"
                    aspect={11 / 8.5}
                    showImageOnPageNote={!highlight.note.isPageNote}
                    annotation={highlight.note}
                    compact={true}
                    titlePassages={highlight.titlePassages}
                    hlContent={highlight.hlContent}
                  />
                </Link>
              </div>
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />
