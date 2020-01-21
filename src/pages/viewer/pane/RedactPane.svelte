<script>
  import Button from "@/common/Button";
  import { layout, redact, undoRedaction } from "@/viewer/layout";
</script>

<h3>Redact Document</h3>
<p>
  Click and drag to draw a black rectangle over each portion of the document
  you’d like to redact. Associated text will be removed when you save your
  redactions.
</p>
<div class="buttonpadded">
  {#if $layout.redactionsUndoable}
    <Button on:click={redact}>Redact</Button>
    <Button secondary={true} on:click={undoRedaction}>Undo</Button>
  {/if}
</div>
