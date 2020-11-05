<script>
  import MetaFieldDialog from "./MetaFieldDialog.svelte";
  import { layout } from "@/manager/layout";

  $: meta = $layout.metaOpen;
</script>

{#if meta != null}
  <MetaFieldDialog
    fieldAccessor={meta.fieldAccessor}
    fieldName={meta.fieldName}
    apiField={meta.apiField}
    headerText={meta.headerText}
    explainerText={meta.explainerText}
    buttonText={meta.buttonText}
    textArea={meta.isTextArea || false}
    fieldValid={meta.fieldValid}
    fieldInvalidText={meta.fieldInvalidText}
    on:dismiss />
{/if}
