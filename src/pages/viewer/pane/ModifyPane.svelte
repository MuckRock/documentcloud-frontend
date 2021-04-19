<script>
  import Button from "@/common/Button";
  import { handlePlural } from "@/util/string";
  import { modification } from "@/viewer/modification/modification";
  import { viewer } from "@/viewer/viewer";
  import { cancelActions } from "@/viewer/document";
  import { showInsertDialog, modify } from "@/viewer/layout";
  import Image from "@/common/Image";
  import { pageImageUrl } from "@/api/viewer";
  import Modification from "@/viewer/modification/Modification";

  const MAX_BUFFER_SIZE = 5;

  const MAX_THUMB_WIDTH = 30;
  const MAX_THUMB_HEIGHT = 39;
</script>

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

{#if $modification.modifyHasSelection}
  <h3>{handlePlural($modification.modifyNumSelected, "Page")} Selected</h3>
  <div class="buttonpadded">
    <Button on:click={() => modification.copy()}>Copy</Button>
    {#if $modification.modifyNumSelected < $modification.pageCount}
      <Button on:click={() => modification.cut()}>Cut</Button>
    {/if}
    <Button on:click={() => modification.rotateClockwise()}>Rotate</Button>
    <Button secondary={true} on:click={() => modification.modifyUnselect()}>
      Unselect
    </Button>
    {#if $modification.modifyNumSelected < $modification.pageCount}
      <Button danger={true} on:click={() => modification.remove()}>
        Remove
      </Button>
    {/if}
  </div>
{:else if $modification.hasCopyBuffer && $viewer.document != null}
  <h3>
    {#if $modification.hasInsert}
      Insert
      {handlePlural($modification.copyBufferLength, "Page")}
    {:else}
      {handlePlural($modification.copyBufferLength, "Page")}
      Pending Insertion
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
              <Image
                src={pageImageUrl(
                  $viewer.document,
                  descriptor.pageSpec.specs[0].pg,
                  30,
                )}
                delay={50}
                width={descriptor.toOrientation() % 2 == 0
                  ? MAX_THUMB_WIDTH
                  : Math.min(
                      MAX_THUMB_WIDTH /
                        $viewer.pageAspects[descriptor.pageSpec.specs[0].pg],
                      MAX_THUMB_HEIGHT,
                    )}
                height={descriptor.toOrientation() % 2 == 0
                  ? Math.min(
                      MAX_THUMB_WIDTH *
                        $viewer.pageAspects[descriptor.pageSpec.specs[0].pg],
                      MAX_THUMB_HEIGHT,
                    )
                  : MAX_THUMB_WIDTH}
              />
            </span>
          </Modification>
        </span>
      {/each}
    </div>
  </h3>

  <p>
    {#if $modification.hasInsert}
      Insert
      {handlePlural($modification.copyBufferLength, "page")}
      {#if $modification.insert == 0}
        at beginning.
      {:else if $modification.insert == $modification.pageCount}
        at end.
      {:else}
        in between page
        {$modification.insert}
        and
        {$modification.insert + 1}.
      {/if}
    {:else}
      Click in-between pages below to mark where to paste
      {handlePlural($modification.copyBufferLength, "page")}.
    {/if}
  </p>
  <div class="buttonpadded">
    {#if $modification.hasInsert}
      <Button on:click={() => modification.pasteAtInsert()}>Insert</Button>
    {:else}
      <Button on:click={() => modification.pasteAtEnd()}>Insert at end</Button>
    {/if}
    <Button secondary={true} on:click={() => modification.clearCopyBuffer()}>
      Cancel
    </Button>
  </div>
{:else if $modification.hasInsert}
  <h3>Insert pages at position</h3>
  <div class="buttonpadded">
    <Button on:click={showInsertDialog}>Insert from other document</Button>
    <Button secondary={true} on:click={() => modification.clearInsertion()}>
      Cancel
    </Button>
  </div>
{:else}
  <h3>Modify Pages</h3>
  <p>
    Select pages below to apply modifications (page rotation, rearranging, and
    deletion). Click in-between pages to insert.
  </p>
{/if}

{#if $modification.hasHistory && !$modification.hasInsert && !$modification.hasCopyBuffer && !$modification.modifyHasSelection}
  <div class="buttonpadded">
    {#if $modification.uncommittedChanges}
      <Button
        on:click={() => {
          modify(modification, cancelActions);
        }}
      >
        Apply Modifications
      </Button>
    {/if}
    <Button
      disabled={!$modification.canUndo}
      secondary={true}
      on:click={() => modification.undo()}>Undo</Button
    >
    <Button
      disabled={!$modification.canRedo}
      secondary={true}
      on:click={() => modification.redo()}>Redo</Button
    >
  </div>
{/if}
