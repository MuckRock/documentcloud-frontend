<script lang="ts">
  import { _ } from "svelte-i18n";

  import Button from "../../../common/Button.svelte";
  import Modification from "../../../viewer/modification/Modification.svelte";
  import ModifyImage from "../ModifyImage.svelte";

  import { modification } from "../../../viewer/modification/modification";
  import { viewer } from "../../../viewer/viewer.js";
  import { cancelActions } from "../../../viewer/document.js";
  import { showInsertDialog, modify } from "../../../viewer/layout.js";

  const MAX_BUFFER_SIZE = 5;
  const MAX_THUMB_WIDTH = 30;
  const MAX_THUMB_HEIGHT = 39;

  $: {
    console.log($modification);
  }
</script>

{#if $modification.modifyHasSelection}
  <h3>
    {$_("modifyPane.pagesSelected", {
      values: { n: $modification.modifyNumSelected },
    })}
  </h3>
  <div class="buttonpadded">
    {#if $modification.uncommittedChanges}
      <Button
        tertiary={true}
        on:click={() => {
          modify($modification, cancelActions);
        }}
      >
        {$_("modifyPane.applyModifications")}
      </Button>
    {/if}
    <Button on:click={() => $modification.copy()}
      >{$_("modifyPane.duplicate")}</Button
    >
    {#if $modification.modifyNumSelected < $modification.pageCount}
      <Button on:click={() => $modification.cut()}
        >{$_("modifyPane.move")}</Button
      >
    {/if}
    <Button on:click={() => $modification.rotateClockwise()}
      >{$_("modifyPane.rotate")}</Button
    >
    <Button secondary={true} on:click={() => $modification.modifyUnselect()}>
      {$_("modifyPane.unselect")}
    </Button>
    {#if $modification.modifyNumSelected < $modification.pageCount}
      <Button danger={true} on:click={() => $modification.remove()}>
        {$_("modifyPane.remove")}
      </Button>
    {/if}
  </div>
{:else if $modification.hasCopyBuffer && $viewer.document != null}
  <h3>
    {#if $modification.hasInsert}
      {$_("modifyPane.insertPages", {
        values: { n: $modification.copyBufferLength },
      })}
    {:else}
      {$_("modifyPane.pagesPending", {
        values: { n: $modification.copyBufferLength },
      })}
    {/if}
    <div class="buffer">
      {#each $modification.copyBuffer
        .slice(0, MAX_BUFFER_SIZE)
        .toDescriptors() as descriptor, i (JSON.stringify(descriptor.json()))}
        <span
          class="item"
          class:faded={$modification.copyBufferLength > MAX_BUFFER_SIZE &&
            i == MAX_BUFFER_SIZE - 1}
        >
          <Modification {descriptor}>
            <span class="img">
              <ModifyImage
                id={descriptor.id}
                page={descriptor.pageSpec.specs[0].pg}
                {descriptor}
                size={30}
                maxThumb={[MAX_THUMB_WIDTH, MAX_THUMB_HEIGHT]}
              />
            </span>
          </Modification>
        </span>
      {/each}
    </div>
  </h3>

  <p>
    {#if $modification.hasInsert}
      {#if $modification.insert == 0}
        {$_("modifyPane.insertBegin", {
          values: { n: $modification.copyBufferLength },
        })}
      {:else if $modification.insert == $modification.pageCount}
        {$_("modifyPane.insertEnd", {
          values: { n: $modification.copyBufferLength },
        })}
      {:else}
        {$_("modifyPane.insertBetween", {
          values: {
            n: $modification.copyBufferLength,
            p0: $modification.insert,
            p1: $modification.insert + 1,
          },
        })}
      {/if}
    {:else}
      {$_("modifyPange.click", {
        values: { n: $modification.copyBufferLength },
      })}
    {/if}
  </p>
  <div class="buttonpadded">
    {#if $modification.hasInsert}
      <Button on:click={() => $modification.pasteAtInsert()}
        >{$_("modifyPane.insert")}</Button
      >
    {:else}
      <Button on:click={() => $modification.pasteAtEnd()}
        >{$_("modifyPane.insertAtEnd")}</Button
      >
    {/if}
    <Button secondary={true} on:click={() => $modification.clearCopyBuffer()}>
      {$_("dialog.cancel")}
    </Button>
  </div>
{:else if $modification.hasInsert}
  <h3>{$_("modifyPane.insertPosition")}</h3>
  <div class="buttonpadded">
    <Button on:click={showInsertDialog}
      >{$_("modifyPane.insertOtherDoc")}</Button
    >
    <Button secondary={true} on:click={() => $modification.clearInsertion()}>
      {$_("dialog.cancel")}
    </Button>
  </div>
{:else}
  <h3>{$_("modifyPane.modifyPages")}</h3>
  <p>
    {$_("modifyPane.select")}
  </p>
{/if}

{#if $modification.hasHistory && !$modification.hasInsert && !$modification.hasCopyBuffer && !$modification.modifyHasSelection}
  <div class="buttonpadded">
    {#if $modification.uncommittedChanges}
      <Button
        tertiary={true}
        on:click={() => {
          modify($modification, cancelActions);
        }}
      >
        {$_("modifyPane.applyModifications")}
      </Button>
    {/if}
    <Button
      disabled={!$modification.canUndo}
      secondary={true}
      on:click={() => $modification.undo()}>{$_("modifyPane.undo")}</Button
    >
    <Button
      disabled={!$modification.canRedo}
      secondary={true}
      on:click={() => $modification.redo()}>{$_("modifyPane.redo")}</Button
    >
  </div>
{/if}

<style lang="scss">
  .buffer {
    position: relative;
    display: inline-block;
    vertical-align: bottom;

    .item {
      display: inline-block;
      vertical-align: top;
      width: 45px;

      &.faded {
        position: relative;
        mask-image: linear-gradient(to right, black, transparent 70%);
      }

      .img {
        display: inline-block;
        margin: 0 5px;
        border: solid 1.5px $primary;
        box-sizing: border-box;
        background: white;
        overflow: hidden;
        vertical-align: top;

        :global(img) {
          object-fit: contain !important;
        }
      }
    }
  }
</style>
