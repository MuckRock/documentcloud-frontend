<script>
  import { formatBytes, stripExtension } from "@/util/string.js";
  import emitter from "@/emit.js";
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  // SVG assets
  import documentIconSvg from "@/assets/document_icon.svg?raw";
  import closeInlineSvg from "@/assets/close_inline.svg?raw";

  const emit = emitter({
    name() {},
    delete() {},
  });

  export let file; // A File object
  export let uploadMode; // boolean
  export let data; // Object
  export let error = false;

  let name = stripExtension(file.name);
  let size = formatBytes(file.size);

  $: {
    // Emit updates to name
    emit.name(name);
  }

  onMount(() => {
    emit.name(name);
  });
  $: {
  }
</script>

<style lang="scss">
  .row {
    display: table-row;

    :global(svg) {
      user-select: none;
    }

    :global(.closeinline) {
      width: 15px;

      :global(svg) {
        cursor: pointer;
      }

      :global(img:hover) {
        opacity: $hover-opacity;
      }
    }

    :global(.doc) {
      width: 20px;

      :global(svg) {
        vertical-align: middle;
      }
    }
  }

  .cell {
    display: table-cell;
    vertical-align: middle;
    padding: 0.2em 0;
  }

  input {
    width: 100%;
    box-sizing: border-box;
    border-radius: $radius;
    outline: none;
    height: 28px;
    padding: 0 12px;
    background: white;
    border: solid 1px gainsboro;
    font-size: 13px;
    font-family: inherit;
    line-height: 28px;

    &.error {
      background: lighten($caution, 37%);
      color: $caution;
    }
  }

  .readonly {
    pointer-events: none;
  }

  .name {
    padding: 0 10px;
  }

  .size {
    width: 45px;
    color: $gray;
    font-size: 12px;
  }

  .progresscontainer {
    position: relative;
  }

  .progress {
    position: absolute;
    height: 28px;
    background: $primary;
    border-radius: $radius;
    font-size: 13px;
    font-family: inherit;
    line-height: 28px;
    transition: $progress-transition;
  }

  .progressinner {
    padding: 0 0 0 12px;
    color: white;
    overflow-x: hidden;
    white-space: pre;
  }
</style>

{#if !uploadMode || !data.done}
  <div class="row">
    <div class="cell doc">
      {@html documentIconSvg}
    </div>
    <div class="cell name" class:readonly={uploadMode}>
      <div class="progresscontainer">
        {#if uploadMode}
          <div class="progress" style="width: {data.progress * 100}%">
            <div class="progressinner">{name}</div>
          </div>
        {/if}
      </div>
      <input
        placeholder={$_("uploadDialog.untitled")}
        readonly={uploadMode}
        bind:value={name}
        class:error
      />
    </div>
    <div class="cell size">{size}</div>
    {#if !uploadMode}
      <div class="cell close">
        <div on:click={emit.delete}>
          {@html closeInlineSvg}
        </div>
      </div>
    {/if}
  </div>
{/if}
