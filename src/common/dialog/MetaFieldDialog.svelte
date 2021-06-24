<script>
  import Button from "@/common/Button";
  import Tooltip from "@/common/Tooltip";
  import HtmlEditor from "@/common/HtmlEditor";
  import { onMount } from "svelte";
  import { simplePlural, nameSingularNumberPlural } from "@/util/string";
  import { editSelectedDocumentInfo } from "@/manager/documents";
  import emitter from "@/emit";
  import { _ } from "svelte-i18n";

  // Stores
  import { layout } from "@/manager/layout";

  export let fieldAccessor;
  export let maxlength;
  export let fieldValid = (value, initial) => value != initial;
  export let fieldName;
  export let apiField;
  export let fieldInvalidText = (value, initial) =>
    value == initial ? "metaFields.defaultFieldInvalidText" : "";
  export let headerText;
  export let explainerText;
  export let buttonText;
  export let textArea = false;

  const emit = emitter({
    dismiss() {},
  });

  const initial =
    $layout.numSelected == 1 ? fieldAccessor($layout.selected[0]) : "";
  let value = initial != null ? initial : "";

  $: valid = fieldValid(value, initial);
  $: invalidReason = fieldInvalidText(value, initial);

  function applyAction() {
    if (!valid) return;
    editSelectedDocumentInfo({ [apiField]: value }, layout, layout.selected);
    emit.dismiss();
  }

  function handleKey(e) {
    if (e.key == "Enter") {
      applyAction();
    }
  }

  let input = null;
  onMount(() => {
    if (input != null) {
      input.focus();
    }
  });
</script>

<style lang="scss">
  input {
    width: 100%;
  }
</style>

<div>
  <div class="mcontent">
    <h1>
      {$_(headerText, {
        values: { n: $layout.numSelected },
      })}
    </h1>
    <p>
      {$_(explainerText, {
        values: { n: $layout.numSelected },
      })}:
    </p>
    <div class="inputpadded">
      {#if textArea}
        <HtmlEditor {maxlength} bind:value />
      {:else}
        <input
          {maxlength}
          bind:value
          bind:this={input}
          on:keypress={handleKey}
        />
      {/if}
    </div>
    <div class="buttonpadded">
      {#if valid}
        <Button on:click={applyAction}>{$_(buttonText)}</Button>
      {:else}
        <Tooltip
          caption={$_(invalidReason, {
            values: { fieldName: $_(fieldName) },
          })}
          delay={500}
        >
          <Button disabled={true}>{$_(buttonText)}</Button>
        </Tooltip>
      {/if}
      <Button secondary={true} on:click={emit.dismiss}
        >{$_("dialog.cancel")}</Button
      >
    </div>
  </div>
</div>
