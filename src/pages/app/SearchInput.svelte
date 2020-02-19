<script>
  import emitter from "@/emit";
  import { highlight } from "@/search/query";

  const emit = emitter({
    search() {}
  });

  export let value = "";
  let input;
  let mirror;

  let selectionStart = null;
  let selectionEnd = null;
  let focused = false;
  let scrollLeft = 0;

  $: {
    if (mirror != null) mirror.scrollLeft = scrollLeft;
  }

  function handleCursor() {
    selectionStart = input.selectionStart;
    selectionEnd = input.selectionEnd;
    if (selectionStart == null || selectionEnd == null) return;
    focused = true;
  }

  function handleBlur() {
    focused = false;
  }

  function handleKeyUp(e) {
    handleCursor();
    if (e.which == 13 || e.keyCode == 13) {
      // Search on enter
      emit.search();
    }
  }

  $: highlights = highlight(value);
</script>

<style lang="scss">
  $fontSize: 16px;
  input {
    -webkit-text-fill-color: transparent;
    outline: none;
    background: none;
    font-size: $fontSize;
  }

  .mirror,
  input {
    line-height: 42px;
    font-family: inherit;
    border: none;
    padding-left: 56px;
    padding-right: 12px;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
  }

  .mirror {
    // opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    overflow: auto;

    word-spacing: 0;
    font-size: 0;

    > span {
      &.raw {
        color: black;
      }

      &.field {
        color: green;
      }

      &.term {
        color: blue;
      }

      > span {
        white-space: pre;
        font-size: $fontSize;
      }
    }
  }

  ::placeholder {
    color: rgba(0, 0, 0, 0.76);
  }
</style>

<input
  bind:this={input}
  bind:value
  on:scroll={() => {
    if (input != null) scrollLeft = input.scrollLeft;
  }}
  placeholder="Search"
  on:keyup={handleKeyUp}
  on:click={handleCursor}
  on:touchend={handleCursor}
  on:focus={handleCursor}
  on:blur={handleBlur} />
<div class="mirror" bind:this={mirror}>
  {#each highlights as highlight}
    <span
      class:raw={highlight.type == 'raw'}
      class:term={highlight.type == 'term'}
      class:field={highlight.type == 'field'}>
      <span>{highlight.text}</span>
    </span>
  {/each}
</div>
