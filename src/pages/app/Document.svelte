<script>
  import Checkbox from "@/common/Checkbox";
  import Button from "@/common/Button";
  import Tooltip from "@/common/Tooltip";
  import Link from "@/router/Link";
  import DocumentThumbnail from "./DocumentThumbnail";

  // Stores
  import {
    layout,
    selectDocument,
    unselectDocument,
    openAccess
  } from "@/manager/layout";
  import { removeDocument } from "@/manager/documents";

  // SVG assets
  import privateIconSvg from "@/assets/private_icon.svg";
  import publicIconSvg from "@/assets/public_icon.svg";
  import organizationIconSvg from "@/assets/organization_icon.svg";

  export let document;

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
  }

  .row {
    display: table-row;
  }

  .check,
  .info {
    @include document-cell;
  }

  .check {
    padding-left: 30px;
  }

  .access {
    @include buttonLike;

    margin-left: 8px;
    vertical-align: middle;
    :global(svg) {
      height: 12px;
    }
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
          <Link newPage={true} to="viewer" params={{ id: document.id }}>
            <Button action={true}>Open</Button>
          </Link>
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
    </div>
  </div>
</div>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />
