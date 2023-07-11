<script>
  import { textAreaResize } from "@/util/textareaResize.js";
  import { domPurify, loadDompurify } from "@/util/domPurify";
  import { _ } from "svelte-i18n";

  loadDompurify();

  export let placeholder = "";
  export let value = "";
  export let maxlength = null;
</script>

<style lang="scss">
  $subpadding: 8px;

  .sidebyside {
    display: table;
    table-layout: fixed;
    width: 100%;

    > * {
      display: table-cell;
      vertical-align: top;
    }
  }

  textarea {
    font-size: 16px;
    width: 100%;
    padding: 2px 4px;
    box-sizing: border-box;
    outline: none;
  }

  .preview {
    margin: 4px 0;

    .title {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 10px;
      margin: 2px $subpadding;
      color: $viewerGray;
    }

    .content {
      margin: 4px $subpadding;
      font: 13px/18px Georgia, Times, serif;
      cursor: text;
      color: #3c3c3c;
      overflow-wrap: break-word;
      max-height: 139px;
      overflow-y: auto;

      :global(a) {
        color: $primary;
      }
    }
  }
</style>

<div class="sidebyside">
  <textarea {placeholder} use:textAreaResize bind:value {maxlength} />
  {#if $domPurify.domPurify !== null && typeof $domPurify.domPurify.sanitize === "function" && value.trim().length > 0}
    <div class="preview">
      <div class="title">{$_("htmlEditor.preview")}</div>
      <!-- Show a preview if possible -->
      <div class="content">
        {@html $domPurify.domPurify.sanitize(value)}
      </div>
    </div>
  {/if}
</div>
