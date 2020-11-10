<script>
  import Button from "@/common/Button";
  import Tooltip from "@/common/Tooltip";
  import HtmlEditor from "@/common/HtmlEditor";
  import { onMount } from "svelte";
  import { simplePlural, nameSingularNumberPlural } from "@/util/string";
  import { editSelectedDocumentInfo } from "@/manager/documents";
  import emitter from "@/emit";

  // Stores
  import { layout } from "@/manager/layout";

  export let fieldAccessor;
  export let fieldValid = (value, initial) => value != initial;
  export let fieldName;
  export let apiField;
  export let fieldInvalidText = (value, initial) =>
    value == initial ? `The document already has this ${fieldName}` : "";
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
    <h1>{headerText(simplePlural($layout.numSelected, 'document'))}</h1>
    <p>
      {explainerText(nameSingularNumberPlural($layout.numSelected, 'selected document'))}:
    </p>
    <div class="inputpadded">
      {#if textArea}
        <HtmlEditor bind:value />
      {:else}<input bind:value bind:this={input} on:keypress={handleKey} />{/if}
    </div>
    <div class="buttonpadded">
      {#if valid}
        <Button on:click={applyAction}>{buttonText}</Button>
      {:else}
        <Tooltip caption={invalidReason} delay={500}>
          <Button disabled={true}>{buttonText}</Button>
        </Tooltip>
      {/if}
      <Button secondary={true} on:click={emit.dismiss}>Cancel</Button>
    </div>
  </div>
</div>
