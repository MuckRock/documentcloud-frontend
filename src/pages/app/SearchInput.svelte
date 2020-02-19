<script>
  import emitter from "@/emit";
  import { highlight, parse } from "@/search/query";

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

  function updateScroll() {
    if (input != null && mirror != null) {
      mirror.scrollLeft = input.scrollLeft;
    }
  }

  function handleCursor() {
    updateScroll();
    selectionStart = input.selectionStart;
    selectionEnd = input.selectionEnd;
    if (selectionStart == null || selectionEnd == null) return;
    focused = true;
  }

  function handleBlur() {
    handleCursor();
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
  $wordSpacing: 1px;
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
    word-spacing: $wordSpacing;
  }

  .mirror {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    overflow-x: scroll;
    color: black;

    word-spacing: 0;
    font-size: 0;

    > span {
      &.field {
        > span:before {
          position: absolute;
          content: "";
          left: -1px;
          top: -2px;
          right: -1px;
          bottom: -2px;
          border-radius: $radius;
          background: rgba($annotationBorder, 0.45);
          border: solid 1px rgba(black, 0.12);
          z-index: -1;
        }
      }

      > span {
        position: relative;
        z-index: 1;
        white-space: pre;
        font-size: $fontSize;
        word-spacing: $wordSpacing;
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
      class:field={highlight.type == 'field'}>
      <span>{highlight.text}</span>
    </span>
  {/each}
</div>
