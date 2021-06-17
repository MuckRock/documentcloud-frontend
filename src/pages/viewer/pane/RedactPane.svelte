<script>
  import Button from "@/common/Button";
  import { layout, redact, undoRedaction } from "@/viewer/layout";
  import { _ } from "svelte-i18n";
</script>

<h3>{$_("redactPane.redactDoc")}</h3>
<p>
  {$_("redactPane.desc")}
</p>
<div class="buttonpadded">
  {#if $layout.redactionsUndoable}
    <Button on:click={redact}>{$_("redactPane.confirm")}</Button>
    <Button secondary={true} on:click={undoRedaction}
      >{$_("redactPane.undo")}</Button
    >
  {/if}
</div>
