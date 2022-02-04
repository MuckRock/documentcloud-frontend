<script>
  import AddonFieldDialog from "./AddonFieldDialog.svelte";
  import { layout } from "@/manager/layout";

  $: addon = $layout.addonFieldsOpen;
</script>

{#if addon != null}
  <AddonFieldDialog
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
