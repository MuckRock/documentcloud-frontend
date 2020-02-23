<script>
  import Loader from "@/common/Loader";
  import Button from "@/common/Button";
  import emitter from "@/emit";
  import { layout, addData } from "@/manager/layout";
  import { addDocumentData, removeDocumentData } from "@/manager/documents";
  import { wrapMultipleSeparate } from "@/util/wrapLoad";
  import { handlePlural } from "@/util/string";
  import { writable } from "svelte/store";

  const emit = emitter({
    dismiss() {}
  });

  let key = "";
  let value = "";

  let loading = writable(false);

  $: keyTrimmed = key.trim();
  $: valueTrimmed = value.trim();

  $: inputValid = keyTrimmed.length > 0;

  async function handleAdd() {
    if (!inputValid) return;

    // TODO: replace with bulk method on backend
    await wrapMultipleSeparate(
      loading,
      layout,
      ...layout.dataDocuments.map(doc => async () =>
        addDocumentData([doc], keyTrimmed, valueTrimmed)
      )
    );
  }
</script>

<style lang="scss">
  .add {
    > * {
      display: inline-block;
      vertical-align: middle;
    }

    .lpad {
      margin-left: 5px;
    }
  }
</style>

<Loader center={true} active={$loading}>
  <div>
    <div class="mcontent">
      <h1>
        Edit Data for {handlePlural($layout.dataDocuments.length, 'Document', true)}
      </h1>
      <p>
        Edit key/value pairs describing
        {#if $layout.dataDocuments.length == 1}
          this document
        {:else}these documents{/if}
        .
      </p>

      <div class="inputpadded">
        <hr />
        <div class="add">
          <input type="text" placeholder="Key" class="key" bind:value={key} />
          :
          <input type="text" placeholder="Value" class="value" bind:value />
          <span class="lpad">
            <Button
              disabledReason={inputValid ? null : 'Enter a key'}
              on:click={handleAdd}>
              + Add
            </Button>
          </span>
        </div>
      </div>

      <div class="buttonpadded">
        <Button on:click={emit.dismiss}>Done</Button>
      </div>
    </div>
  </div>
</Loader>
