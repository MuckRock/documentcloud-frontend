<script>
  import { _, date } from "svelte-i18n";

  import Checkbox from "@/common/Checkbox.svelte";
  import Button from "@/common/Button.svelte";
  import AccessIcon from "@/common/AccessIcon.svelte";
  import Image from "@/common/Image.svelte";
  import Progress from "@/common/Progress.svelte";
  import HtmlField from "@/common/HtmlField.svelte";
  import DocumentThumbnail from "./DocumentThumbnail.svelte";
  import Annotation from "@/pages/viewer/Annotation.svelte";

  import { TAG_KEY } from "../../config/config.js";
  import { documents } from "@/manager/documents.js";

  // Stores
  import {
    layout,
    unselectDocument,
    editData,
    openAccess,
    openRevisions,
  } from "../../manager/layout.js";
  import { removeDocument, selectDocument } from "@/manager/documents.js";
  import { projects } from "@/manager/projects.js";
  import { projectUrl, dataUrl } from "@/search/search.js";
  import { orgsAndUsers } from "@/manager/orgsAndUsers.js";

  import closeSimpleSvg from "@/assets/close_inline.svg?raw";
  import pencilSvg from "@/assets/pencil.svg?raw";

  import { pageImageUrl } from "@/api/viewer.js";
  import RevisionIcon from "../../common/RevisionIcon.svelte";

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
</script>

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
      progress={$documents.realProgressMap[document.id]}
      processed={$documents.pagesProcessedMap[document.id]}
      pageCount={$documents.pageCountMap[document.id]}
      noteCount={document.notes?.length}
      publicNote={document.notes?.some((x) => x.access === "public")}
      orgNote={document.notes?.some((x) => x.access === "organization")}
      privateNote={document.notes?.some((x) => x.access === "private")}
      on:pick
    />

    <div class="info">
      <div class="document-title-row">
        <h2>{document.title}</h2>
        {#if !embed}
          <div class="document-title-row-actions">
            <AccessIcon
              access={document.access}
              editable={document.editAccess}
              on:click={() => openAccess([document])}
            />
            <RevisionIcon
              revisions={document.revisions}
              showCount
              on:click={() => openRevisions([document])}
            />
          </div>
        {/if}
      </div>
      {#if !embed}
        <div class="document-meta-row">
          {#if document.pageCount > 0}
            <p class="document-meta pageCount">
              {$_("document.pageCount", { values: { n: document.pageCount } })}
            </p>
          {/if}
          {#if document.source != null && document.source.trim().length > 0}
            <p class="document-meta source">
              {$_("document.source")}: {document.source}
            </p>
          {/if}
          {#if document.userName !== null}
            <p class="document-meta userName">{document.userOrgString}</p>
          {/if}
          <time
            class="document-meta createdAt"
            datetime={document.createdAt.toISOString()}
            title={document.createdAt.toISOString()}
            >{$date(document.createdAt, { format: "medium" })}</time
          >
        </div>
      {/if}
      {#if document.description != null && document.description.trim().length > 0}
        <div class="description" class:embeddescription={embed}>
          <HtmlField content={document.description} />
        </div>
      {/if}
      {#if !embed}
        <div class="actions">
          {#if document.viewable}
            <a href={document.canonicalUrl}>
              <Button action>{$_("document.open")}</Button>
            </a>
            {#if document.readable}
              <div class="updating">
                {$_("document.updating")}
                <Progress initializing compact progress={0} />
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
                <a href={projectUrl($projects.projectsById[id])}>
                  <Button plain={true}>
                    <div class="smallinfo">{$_("document.project")}</div>
                    {$projects.projectsById[id].title}
                  </Button>
                </a>
              {/if}
            {/each}
            {#each document.dataPoints as { key, value }}
              <a href={dataUrl(key, value)}>
                <Button plain={true}>
                  {#if key != TAG_KEY}{key}:{/if}
                  {value}
                </Button>
              </a>
            {/each}
            {#if document.dataPoints.length > 0 && document.editAccess}
              <button
                class="pencil buttonLike"
                on:click={() => editData([document])}
              >
                {@html pencilSvg}
              </button>
            {/if}
          {/if}
        </div>
        {#if document.highlights != null && document.highlights.length > 0 && !closeHighlights}
          <div class="hinfo">
            <button
              class="x buttonLike"
              on:click={() => (closeHighlights = true)}
            >
              {@html closeSimpleSvg}
            </button>

            {#if moreToExpand}
              <span>
                {$_("document.totalMatchingPages", {
                  values: {
                    n: highlights.length,
                    m: document.highlights.length,
                  },
                })}
              </span>
              <button
                class="padleft buttonLike"
                on:click={() => (expandHighlights = true)}
              >
                {$_("document.showAll")}
              </button>
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
                <a
                  class="ib"
                  href={document.relativePageUrl(highlight.page + 1)}
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
                </a>
              </div>
            {/each}
          </div>
        {/if}

        {#if document.noteHighlights != null && document.noteHighlights.length > 0 && !closeNoteHighlights}
          <div class="hinfo">
            <button
              class="x buttonLike"
              on:click={() => (closeNoteHighlights = true)}
            >
              {@html closeSimpleSvg}
            </button>

            <span>Notes matching the query</span>
          </div>

          <div class="highlights note-highlights">
            {#each noteHighlights as highlight}
              <div>
                <a href={document.relativeNoteUrl(highlight.note)}>
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
                </a>
              </div>
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

<style>
  h2 {
    font-size: var(--normal);
    font-weight: 600;
    padding-top: 10px;
    padding-bottom: 6px;
    word-break: break-word;
    margin: 2px 0;
    padding: 0;
  }

  .card {
    display: table;
  }
  @media only screen and (max-width: 720px) {
    .card {
      margin-bottom: 15px;
    }
  }

  .card .row {
    display: table-row;
  }

  .card .row > * {
    display: table-cell;
    vertical-align: top;
  }

  .check {
    padding-top: 30px;
    padding-left: 30px;
  }

  .updating {
    color: var(--gray);
    margin-bottom: 26px;
  }

  .actions {
    font-size: 14px;
    padding-bottom: 10px;
  }
  .actions span {
    display: inline-block;
    margin: 6px 0;
  }

  .actions span.pending {
    color: var(--gray);
    font-style: italic;
  }

  .actions span.error {
    color: var(--caution);
  }

  .hinfo {
    font-size: 13px;
    font-weight: bold;
    margin: 15px 0;
  }

  .hinfo > * {
    display: inline-block;
    vertical-align: middle;
  }

  .hinfo .x {
    padding-right: 5px;
    height: 14px;
  }

  .hinfo .x :global(svg) {
    height: 12px;
    opacity: 0.7;
  }

  .hinfo .padleft {
    padding-left: 5px;
  }

  .highlights {
    color: #333;
    font-size: 14px;
    line-height: 18px;
    display: table;
    width: 100%;
    padding-bottom: 27px;
  }

  .highlights .row {
    display: table-row;
  }

  .highlights .row > * {
    display: table-cell;
    vertical-align: top;
  }

  .highlights .page {
    text-align: center;
  }

  .page :global(img) {
    width: 40px;
    height: 52px;
    box-sizing: border-box;
    border: solid 1px gainsboro;
  }

  .highlights .page .number {
    font-weight: bold;
    font-size: 11px;
    padding-bottom: 15px;
  }

  .highlights .highlight {
    width: 100%;
    padding-top: 8px;
    padding-left: 15px;
    padding-bottom: 15px;
  }
  .highlights .highlight .passage.highlighted {
    background: var(--annotationBorder);
  }

  .note-highlights {
    position: relative;
  }

  .smallinfo {
    font-size: 12px;
    color: var(--gray);
    display: inline-block;
    margin-right: 2px;
    font-style: italic;
  }

  .pencil {
    vertical-align: middle;
    height: 10px;
  }

  .document-title-row {
    display: flex;
    gap: 0.5rem;
  }

  .document-title-row h2 {
    flex: 0 1 auto;
  }

  .document-title-row-actions {
    flex: 0 1 auto;
    display: flex;
    gap: 0.5em 0;
    flex-direction: row;
    align-items: center;
    height: 1.5em;
  }

  .document-meta-row {
    display: flex;
    flex-wrap: wrap;
  }

  .document-meta {
    color: var(--gray);
    font-size: var(--small);
    line-height: 1.5;
    font-weight: normal;
    margin: 0;
    padding: 0;
  }

  .document-meta:not(:last-child)::after {
    content: "–";
    margin: 0 0.25rem;
  }

  .description {
    margin: 8px 0 -8px 0;
  }
  .description.embeddescription {
    margin-bottom: 20px;
  }

  .description.embeddescription :global(.content) {
    max-height: 135px;
  }
</style>
