<script>
  import { domPurify, loadDompurify } from "@/util/domPurify";
  loadDompurify();

  export let content = "";
</script>

<style lang="scss">
  $subpadding: 8px;

  .preview {
    margin: 4px 0;

    .content {
      margin: 4px $subpadding;
      font: 13px/18px Georgia, Times, serif;
      cursor: text;
      color: #3c3c3c;
      max-height: 300px;
      word-wrap: break-word;
      overflow-y: auto;

      :global(a) {
        color: $primary;
      }
    }

    &.static .content {
      margin: 0 0 $subpadding 0;
    }
  }
</style>

<div class="preview static">
  <div class="content">
    {#if $domPurify.domPurify != null}
      {@html $domPurify.domPurify.sanitize(content)}
    {/if}
  </div>
</div>
