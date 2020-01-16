<script>
  import Button from "@/common/Button";
  import Tooltip from "@/common/Tooltip";
  import { onMount } from "svelte";
  import { simplePlural, nameSingularNumberPlural } from "@/util/string";
  import emitter from "@/emit";

  // Stores
  import { layout } from "@/manager/layout";
  import { renameSelectedDocuments } from "@/manager/documents";

  const emit = emitter({
    dismiss() {}
  });

  const initial = $layout.numSelected == 1 ? $layout.selected[0].title : "";
  let name = initial != null ? initial : "";

  $: valid = name != initial && name.trim().length > 0;
  $: invalidReason =
    name == initial
      ? "The document already has this name"
      : name.trim().length == 0
      ? "Enter a valid name"
      : "";

  function renameSelected() {
    if (!valid) return;
    renameSelectedDocuments(name);
    emit.dismiss();
  }

  function handleKey(e) {
    if (e.key == "Enter") {
      renameSelected();
    }
  }

  let input;
  onMount(() => {
    input.focus();
  });
</script>

<div>
  <div class="mcontent">
    <h1>Rename {simplePlural($layout.numSelected, 'document')}</h1>
    <p>
      Enter a name below for the {nameSingularNumberPlural($layout.numSelected, 'selected document')}:
    </p>
    <div class="inputpadded">
      <input bind:value={name} bind:this={input} on:keypress={handleKey} />
    </div>
    <div class="buttonpadded">
      {#if valid}
        <Button on:click={renameSelected}>Rename</Button>
      {:else}
        <Tooltip caption={invalidReason} delay={500}>
          <Button disabled={true}>Rename</Button>
        </Tooltip>
      {/if}
      <Button secondary={true} on:click={emit.dismiss}>Cancel</Button>
    </div>
  </div>
</div>
