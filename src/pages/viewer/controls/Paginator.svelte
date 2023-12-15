<script>
  import { _ } from "svelte-i18n";

  import { doc } from "@/viewer/document.js";
  import { viewer } from "@/viewer/viewer.js";

  // SVG assets
  import leftPaginator from "@/assets/left_paginator.svg?raw";
  import rightPaginator from "@/assets/right_paginator.svg?raw";

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

{#if $viewer.loaded && $doc.mode !== "search" && $doc.mode !== "notes" && $doc.mode !== "thumbnail"}
  <div class="paginator">
    <button class="paginate left buttonLike" on:click={() => decrement(false)}>
      {@html leftPaginator}
    </button>
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
          if (e.key == "Escape") {
            dismiss();
          } else if (e.key == "Enter") {
            handleInput();
          } else if (e.key == "ArrowUp") {
            increment(true);
          } else if (e.key == "ArrowDown") {
            decrement(true);
          }
        }}
      />
    </span>
    <span class="rest">{$_("paginator.of")} {$viewer.document.pageCount}</span>
    <button class="paginate right buttonLike" on:click={() => increment(false)}>
      {@html rightPaginator}
    </button>
  </div>
{/if}

<style>
  .paginator {
    --inputHeight: 23px;
    --arrowHeight: 18px;
    --arrowPadding: 13px;

    user-select: none;
    color: var(--viewerDarkGray);
  }

  .paginator .page {
    position: relative;
    font-weight: normal;
    font-size: 15px;
    padding: 0 18px;
    background: #ffffff;
    box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.25);
    border-radius: var(--radius);
    display: inline-block;
    height: var(--inputHeight, 23px);
    line-height: var(--inputHeight, 23px);
    vertical-align: middle;
  }

  .paginator .page .absolute,
  .paginator .page input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .paginator .page .hidden {
    opacity: 0;
  }

  .paginator .page input {
    opacity: 0;
    box-sizing: border-box;
    text-align: center;
    font-weight: inherit;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
  }
  .paginator .page :focus {
    opacity: 1;
  }

  .paginator .rest {
    display: inline-block;
    line-height: var(--inputHeight, 23px);
    vertical-align: middle;
    padding-left: 8px;
  }

  .paginator .paginate {
    display: inline-block;
    font-size: 0;
    padding: calc((var(--inputHeight, 23px) - var(--arrowHeight, 18px)) / 2) 0;
    vertical-align: middle;
  }

  .paginator .paginate.left {
    padding-right: var(--arrowPadding, 13px);
  }

  .paginator .paginate.right {
    padding-left: var(--arrowPadding, 13px);
  }
</style>
