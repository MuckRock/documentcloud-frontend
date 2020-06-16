<script>
  import Loader from "@/common/Loader";
  import Button from "@/common/Button";
  import Dropdown from "@/common/Dropdown";
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";
  import NoWhitespace from "@/common/NoWhitespace";
  import emitter from "@/emit";
  import { layout, addData } from "@/manager/layout";
  import {
    addDocumentData,
    replaceDocumentData,
    removeDocumentData
  } from "@/manager/documents";
  import { showConfirm } from "@/manager/confirmDialog";
  import { wrapMultipleSeparate } from "@/util/wrapLoad";
  import { handlePlural } from "@/util/string";
  import { intersection } from "@/util/array";
  import { writable } from "svelte/store";
  import { onMount, onDestroy } from "svelte";

  // SVG assets
  import pencilSvg from "@/assets/pencil.svg";

  const emit = emitter({
    dismiss() {}
  });

  let key = "";
  let value = "";

  $: {
    key = key.replace(" ", "_");
  }

  let loading = writable(false);

  const TAG_KEY = process.env.TAG_KEY;

  // Technically needs to pass one or more of these characters,
  // but keyTrimmed captures that and gives a more descriptive message
  const KEY_REGEX = /^[A-Za-z0-9-_]*$/;

  let addTag = true;

  $: keyTrimmed = addTag ? TAG_KEY : key.trim();
  $: valueTrimmed = value.trim();

  $: keyValid = KEY_REGEX.test(keyTrimmed);
  $: inputValid = keyValid && valueTrimmed.length > 0 && keyTrimmed.length > 0;

  let dataDocuments = [];
  let subscriptions = [];
  onMount(() => {
    subscriptions = [
      layout.subscribe(() => (dataDocuments = layout.dataDocuments))
    ];
  });

  onDestroy(() => {
    subscriptions.forEach(subscription => subscription());
  });

  $: mutualDataPoints = intersection(
    dataDocuments.map(d => d.dataPoints),
    (a, b) => a.key == b.key && a.value == b.value
  );
  $: emptyData = mutualDataPoints.length == 0;

  let editingKey = null;
  let editingValue = null;
  let editKey = null;
  let editValue = null;

  $: editKeyTrimmed = editKey == null ? null : editKey.trim();
  $: editValueTrimmed = editValue == null ? null : editValue.trim();

  $: editKeyValid = KEY_REGEX.test(editKeyTrimmed);
  $: editTrimValid =
    editKeyValid &&
    (editKey == TAG_KEY
      ? editValueTrimmed != null && editValueTrimmed.length > 0
      : editKeyTrimmed != null &&
        editKeyTrimmed.length > 0 &&
        editValueTrimmed != null &&
        editValueTrimmed.length > 0);
  $: editValid =
    editTrimValid &&
    (editKeyTrimmed != editingKey || editValueTrimmed != editingValue);

  $: editMode = editingKey != null && editingValue != null;

  function startEdit(key, value) {
    editingKey = key;
    editingValue = value;
    editKey = key;
    editValue = value;
  }

  function cancelEdit() {
    editingKey = null;
    editingValue = null;
    editKey = null;
    editValue = null;
  }

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
    // Trigger update
    layout.dataDocuments = layout.dataDocuments;
  }

  async function handleEdit() {
    if (!editValid) return;

    const previousKey = editingKey;
    const previousValue = editingValue;
    const newKey = editKey;
    const newValue = editValue;

    // Get out of edit mode
    cancelEdit();

    // TODO: replace with bulk method on backend
    await wrapMultipleSeparate(
      loading,
      layout,
      ...layout.dataDocuments.map(doc => async () =>
        replaceDocumentData([doc], previousKey, previousValue, newKey, newValue)
      )
    );
    // Trigger update
    layout.dataDocuments = layout.dataDocuments;
  }

  async function handleRemove(key, value) {
    showConfirm(
      "Confirm remove data point",
      `Proceeding will remove the ${
        key == TAG_KEY ? "" : `${key}:`
      }${value} data point from the specified documents. Do you wish to continue?`,
      "Remove",
      async () => {
        // TODO: replace with bulk method on backend
        await wrapMultipleSeparate(
          loading,
          layout,
          ...layout.dataDocuments.map(doc => async () =>
            removeDocumentData([doc], key, value)
          )
        );
        // Trigger update
        layout.dataDocuments = layout.dataDocuments;
      }
    );
  }
</script>

<style lang="scss">
  .lpad {
    margin-left: 5px;
  }

  .add {
    > * {
      display: inline-block;
      vertical-align: middle;
    }

    .dropdown {
      padding: 0 0 0 15px;
      width: 122px;

      .info {
        p {
          margin: 6px 7px 1px 7px;
        }
        em {
          background: rgba(0, 0, 0, 0.04);
          border-radius: $radius;
          padding: 2px 5px;
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.22);
        }
      }
    }
  }

  input:read-only {
    background: rgba(0, 0, 0, 0.05);
    pointer-events: none;
  }

  .fyi {
    background: $fyi;
    padding: 1em;
    border-radius: 10px;
    color: $modal;
    line-height: 1.3;
    font-size: 14px;
  }

  .row {
    margin: 6px 0;

    > * {
      display: inline-block;
      vertical-align: middle;
    }

    .pencil {
      @include buttonLike;
      margin: 0 12px 0 5px;
    }
  }

  .faded {
    opacity: 0.5;
    pointer-events: none;
  }
</style>

<Loader center={true} active={$loading}>
  <div>
    <div class="mcontent">
      <h1 class:faded={editMode}>
        Add Data for {handlePlural(dataDocuments.length, 'Document', true)}
      </h1>
      <div class="inputpadded" class:faded={editMode}>
        <div class="add">
          <span class="dropdown">
            <Dropdown
              table={true}
              bordered={true}
              horizPadding={15}
              vertPadding={8}>
              <span class="action" slot="title">
                {#if addTag}Tag{:else}Key / Value{/if}
                <span class="dropper">▼</span>
                {#if addTag}
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {/if}
              </span>
              <Menu>
                <MenuItem on:click={() => (addTag = true)}>
                  Tag
                  <div class="info">
                    Add custom tags to categorize your documents.
                    <p>
                      e.g.
                      <NoWhitespace>
                        <em>report</em>
                        <span>,&nbsp;</span>
                        <em>lawsuit</em>
                        <span>,&nbsp;</span>
                        <em>email</em>
                        <span>.</span>
                      </NoWhitespace>
                    </p>
                  </div>
                </MenuItem>
                <MenuItem on:click={() => (addTag = false)}>
                  Key / Value
                  <div class="info">
                    Add custom key / value pairs for precise categorization of
                    your documents.
                    <p>
                      e.g.
                      <NoWhitespace>
                        <em>state:&nbsp;California</em>
                        <span>,&nbsp;</span>
                        <em>year:&nbsp;2016</em>
                        <span>,&nbsp;</span>
                        <em>type:&nbsp;memo</em>
                        <span>.</span>
                      </NoWhitespace>
                    </p>
                  </div>
                </MenuItem>
              </Menu>
            </Dropdown>
          </span>
          {#if !addTag}
            <input type="text" placeholder="Key" class="key" bind:value={key} />
            :
          {/if}
          <input
            type="text"
            placeholder={addTag ? 'Tag' : 'Value'}
            class="value"
            bind:value />
          <span class="lpad">
            <Button
              disabledReason={inputValid ? null : keyValid ? (addTag ? 'Enter a tag' : 'Enter a key') : 'Keys can only contain letters, numbers, underscores (_), and dashes (-)'}
              on:click={handleAdd}>
              + Add
            </Button>
          </span>
        </div>
      </div>

      {#if emptyData}
        <p class="fyi">
          You have not yet added any data to the specified documents. Add tags
          and key/value pairs to categorize and organize your documents. You can
          filter and search on document data to give you powerful control over
          document management.
        </p>
      {:else}
        <div>
          <h1>Manage Document Data</h1>
          {#each mutualDataPoints as { key, value }}
            <div
              class="row"
              class:faded={editMode && (editingKey != key || editingValue != value)}>
              {#if editingKey == key && editingValue == value}
                {#if key != TAG_KEY}
                  <input bind:value={editKey} />
                  :
                {/if}
                <input bind:value={editValue} />
                <span class="lpad">
                  <span style="margin-right: 3px;">
                    <Button
                      small={true}
                      disabledReason={editKeyValid ? (editTrimValid ? (editValid ? null : 'Value remains unchanged') : 'Key/value cannot be empty') : 'Keys can only contain letters, numbers, underscores (_), and dashes (-)'}
                      on:click={handleEdit}>
                      Edit
                    </Button>
                  </span>
                  <Button small={true} secondary={true} on:click={cancelEdit}>
                    Cancel
                  </Button>
                </span>
              {:else}
                {#if key != TAG_KEY}
                  <input readonly bind:value={key} />
                  :
                {/if}
                <input readonly bind:value />
                <span class="pencil" on:click={() => startEdit(key, value)}>
                  {@html pencilSvg}
                </span>
                <Button
                  nondescript={true}
                  caution={true}
                  on:click={() => handleRemove(key, value)}>
                  Remove
                </Button>
              {/if}
            </div>
          {/each}
        </div>
      {/if}

      <div class="buttonpadded" class:faded={editMode}>
        <Button on:click={emit.dismiss}>Done</Button>
      </div>
    </div>
  </div>
</Loader>
