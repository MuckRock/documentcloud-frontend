<script>
  import Button from "@/common/Button";
  import { hideEditSections } from "@/viewer/layout";
  import { viewer } from "@/viewer/viewer";

  // SVG assets
  import pencilSvg from "@/assets/pencil.svg";
  import closeSimpleSvg from "@/assets/close_simple.svg";

  let pendingSections = [];

  let pendingPage = "";
  let pendingTitle = "";
  let update = false;
  let updatingIndex = null;
  $: updatePage =
    !update || updatingIndex == null
      ? null
      : pendingSections[updatingIndex].page;
  $: updateTitle =
    !update || updatingIndex == null
      ? null
      : pendingSections[updatingIndex].title;

  $: {
    pendingPage = pendingPage.replace(/[^0-9]/g, "");
  }

  function addSection() {
    let alreadyAdded = false;
    if (update) {
      update = false;
      if (pageAsNumber == updatePage) {
        // Same page number: update in place
        pendingSections[updatingIndex] = {
          page: pageAsNumber,
          title: pendingTitle
        };
        pendingSections = pendingSections;
        alreadyAdded = true;
      } else {
        // Different page number: remove and add
        removeSection(updatingIndex);
        addSection();
        return;
      }
    }

    if (!alreadyAdded) {
      pendingSections = [
        ...pendingSections,
        { page: pageAsNumber, title: pendingTitle }
      ];
      pendingSections.sort((a, b) => a.page - b.page);
    }

    // Reset the inputs
    pendingPage = "";
    pendingTitle = "";
  }

  function removeSection(idx) {
    const removed = pendingSections.splice(idx, 1);
    pendingSections = pendingSections;
    return removed[0];
  }

  function editSection(idx) {
    updatingIndex = idx;
    const section = pendingSections[idx];
    pendingPage = `${section.page}`;
    pendingTitle = section.title;
    update = true;
  }

  function cancelUpdate() {
    // Reset the inputs
    pendingPage = "";
    pendingTitle = "";
    update = false;
    updatingIndex = null;
  }

  $: pageAsNumber = parseInt(pendingPage);
  $: pageCollided =
    pageAsNumber != null &&
    pendingSections.map(section => section.page).includes(pageAsNumber);
  $: pageSameAsEdit = update && updatePage == pageAsNumber;
  $: titleSameAsEdit = update && updateTitle == pendingTitle;
  $: pageValid =
    $viewer.loaded &&
    pageAsNumber != null &&
    pageAsNumber > 0 &&
    pageAsNumber <= $viewer.document.pageCount &&
    (!pageCollided || pageSameAsEdit);
  $: titleTrimmed = pendingTitle.trim();
  $: titleUpdateValid = !update || !(pageSameAsEdit && titleSameAsEdit);
  $: titleValid = titleUpdateValid && titleTrimmed.length > 0;
</script>

<style lang="scss">
  .toc {
    border-top: solid 1px $gray;
    border-bottom: solid 1px $gray;
    padding: 15px 0;
    margin: 15px 0 30px 0;

    &.disabled {
      pointer-events: none;

      > * {
        opacity: 0.3;
      }
    }

    .empty {
      color: $gray;
      font-style: italic;
    }

    .section {
      &.special {
        opacity: 1;
      }

      span {
        vertical-align: middle;
        display: inline-block;
      }

      .page {
        font-weight: bold;
        font-size: 12px;
        padding-right: 5px;
        color: $gray;
      }

      .edit {
        margin-top: 5px;
        margin-right: 10px;
      }

      .remove {
        margin-top: 2px;
        margin-right: 10px;
      }

      .edit,
      .remove {
        @include buttonLike;
      }
    }
  }

  .pendingsection {
    p {
      margin: 7px 0;
      font-weight: bold;
      font-size: 14px;
      color: $modal;
    }

    .actions {
      * {
        display: inline-block;
        vertical-align: middle;
      }

      input {
        margin: 0 2px;
      }

      .pageinput {
        max-width: 5ch;
      }

      .add,
      .cancel {
        margin-left: 5px;
      }
    }
  }
</style>

<div>
  <div class="mcontent">
    <h1>Edit Sections</h1>
    <p>Manage sections to organize your document with a table of contents.</p>

    <!-- Existing TOC -->
    <div class="toc" class:disabled={update}>
      {#if pendingSections.length > 0}
        {#each pendingSections as section, i}
          <div class="section" class:special={update && updatingIndex == i}>
            <span class="edit" on:click={() => !update && editSection(i)}>
              {@html pencilSvg}
            </span>
            <span class="remove" on:click={() => !update && removeSection(i)}>
              {@html closeSimpleSvg}
            </span>
            <span class="page">p. {section.page}</span>
            <span class="title">{section.title}</span>
          </div>
        {/each}
      {:else}
        <!-- No sections -->
        <div class="empty">You have not added any sections</div>
      {/if}
    </div>

    <!-- Add section input range -->
    <div class="pendingsection">
      <p>
        {#if update}Edit the selected section{:else}Add a new section{/if}
      </p>
      <div class="actions">
        <span class="page">p.</span>
        <input
          class="pageinput"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder="#"
          bind:value={pendingPage} />
        <input
          class="titleinput"
          type="text"
          placeholder="Title"
          bind:value={pendingTitle} />
        <span class="add">
          <Button
            disabledReason={pageValid ? (titleValid ? null : titleUpdateValid ? 'Please enter a title' : 'Enter a new title or page number') : pageCollided ? 'You must enter a unique page number' : 'Page number is invalid'}
            on:click={addSection}>
            {#if update}+ Update{:else}+ Add{/if}
          </Button>
        </span>
        {#if update}
          <span class="cancel">
            <Button secondary={true} on:click={cancelUpdate}>Cancel</Button>
          </span>
        {/if}
      </div>
      <div class="buttonpadded">
        <Button secondary={true} on:click={hideEditSections}>Cancel</Button>
      </div>
    </div>
  </div>
</div>
