<script>
  import MetaFieldDialog from "./MetaFieldDialog.svelte";
  import { layout } from "@/manager/layout.js";

  $: meta = $layout.metaOpen;
</script>

{#if meta != null}
  <MetaFieldDialog
    fieldAccessor={meta.fieldAccessor}
    maxlength={meta.charLimit}
    fieldName={meta.fieldName}
    fieldNameUppercase={meta.fieldNameUppercase}
    apiField={meta.apiField}
    headerText={meta.headerText}
    explainerText={meta.explainerText}
    buttonText={meta.buttonText}
    textArea={meta.isTextArea || false}
    fieldValid={meta.fieldValid}
    fieldInvalidText={meta.fieldInvalidText}
    on:dismiss
  />
{/if}
