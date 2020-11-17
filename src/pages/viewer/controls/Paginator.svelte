<script>
  import { doc } from "@/viewer/document";
  import { viewer } from "@/viewer/viewer";

  // SVG assets
  import leftPaginator from "@/assets/left_paginator.svg";
  import rightPaginator from "@/assets/right_paginator.svg";

  let input;
  let customPage = "1";

  let intentionalBlur = false;
  let hadInput = false;

  $: {
    customPage = customPage.replace(/[^0-9]/g, "");
  }

  function dismiss() {
    intentionalBlur = true;
    input.blur();
  }

  function select() {
    if (input == null) return;
    setTimeout(() => input.select(), 0);
  }

  function getPageFromInput() {
    if (!viewer.loaded || input == null) return null;

    const pageNumber = parseInt(customPage);
    if (pageNumber == null) return null;
    // Disregard page out of bounds.
    if (pageNumber < 1 || pageNumber > viewer.document.pageCount) return null;

    return pageNumber;
  }

  function gotoPage(readablePageNumber) {
    customPage = `${readablePageNumber}`;
    doc.jumpToPage(readablePageNumber - 1);
  }

  function handleInput() {
    if (intentionalBlur) {
      intentionalBlur = false;
      return;
    }
    if (!viewer.loaded || input == null || !hadInput) return;

    // Blur the input
    dismiss();

    // Pull out page number
    const pageNumber = getPageFromInput();
    if (pageNumber == null) return;

    // Jump the viewer
    gotoPage(pageNumber);
  }

  function increment(fromInput = false) {
    let pageNumber = fromInput ? getPageFromInput() : doc.visiblePageNumber;
    if (pageNumber == null) return;

    pageNumber = Math.min(pageNumber + 1, viewer.document.pageCount);

    // Jump the viewer
    gotoPage(pageNumber);
    if (fromInput) select();
  }

  function decrement(fromInput = false) {
    let pageNumber = fromInput ? getPageFromInput() : doc.visiblePageNumber;
    if (pageNumber == null) return;

    pageNumber = Math.max(pageNumber - 1, 1);

    // Jump the viewer
    gotoPage(pageNumber);
    if (fromInput) select();
  }
</script>

<style lang="scss">
  $inputHeight: 23px;
  $arrowHeight: 18px;
  $arrowPadding: 13px;

  .paginator {
    user-select: none;
    color: $viewerDarkGray;

    .page {
      position: relative;
      font-weight: normal;
      font-size: 15px;
      padding: 0 18px;
      background: #ffffff;
      box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.25);
      border-radius: $radius;
      display: inline-block;
      height: $inputHeight;
      line-height: $inputHeight;
      vertical-align: middle;

      .absolute,
      input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      .hidden {
        opacity: 0;
      }

      input {
        opacity: 0;
        box-sizing: border-box;
        text-align: center;
        font-weight: inherit;
        font-family: inherit;
        font-size: inherit;
        color: inherit;

        &:focus {
          opacity: 1;
        }
      }
    }

    .rest {
      display: inline-block;
      line-height: $inputHeight;
      vertical-align: middle;
      padding-left: 8px;
    }

    .paginate {
      @include buttonLike;

      display: inline-block;
      font-size: 0;
      padding: (($inputHeight - $arrowHeight) / 2) 0;
      vertical-align: middle;

      &.left {
        padding-right: $arrowPadding;
      }

      &.right {
        padding-left: $arrowPadding;
      }
    }
  }
</style>

{#if $viewer.loaded && $doc.mode != 'search' && $doc.mode != 'notes'}
  <div class="paginator">
    <span class="paginate left" on:click={() => decrement(false)}>
      {@html leftPaginator}
    </span>
    <span class="page">
      <span class="hidden">{$viewer.document.pageCount}</span>
      <span class="absolute">{$doc.visiblePageNumber}</span>
      <input
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        bind:this={input}
        bind:value={customPage}
        on:focus={() => {
          intentionalBlur = false;
          customPage = `${$doc.visiblePageNumber}`;
          hadInput = false;
          select();
        }}
        on:blur={handleInput}
        on:input={() => (hadInput = true)}
        on:keydown={(e) => {
          if (input != document.activeElement) return;
          if (e.key == 'Escape') {
            dismiss();
          } else if (e.key == 'Enter') {
            handleInput();
          } else if (e.key == 'ArrowUp') {
            increment(true);
          } else if (e.key == 'ArrowDown') {
            decrement(true);
          }
        }} />
    </span>
    <span class="rest">of {$viewer.document.pageCount}</span>
    <span class="paginate right" on:click={() => increment(false)}>
      {@html rightPaginator}
    </span>
  </div>
{/if}
