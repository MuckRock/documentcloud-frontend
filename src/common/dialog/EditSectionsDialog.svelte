<script>
  import Button from "@/common/Button";
  import Loader from "@/common/Loader";
  import { hideEditSections } from "@/viewer/layout";
  import { viewer } from "@/viewer/viewer";
  import { layout } from "@/viewer/layout";

  import { addSection, removeSection, replaceSection } from "@/api/section";
  import { wrapLoadSeparate } from "@/util/wrapLoad";
  import { showConfirm } from "@/manager/confirmDialog";

  // SVG assets
  import pencilSvg from "@/assets/pencil.svg";
  import closeSimpleSvg from "@/assets/close_simple.svg";

  import { writable } from "svelte/store";

  const sectionTitleLimit = process.env.SECTION_TITLE_CHAR_LIMIT;

  let loading = writable(false);

  let pendingPage = "";
  let pendingTitle = "";
  let update = false;
  let updatingIndex = null;
  $: updatePage =
    !update || updatingIndex == null
      ? null
      : $viewer.sections[updatingIndex].page;
  $: updateTitle =
    !update || updatingIndex == null
      ? null
      : $viewer.sections[updatingIndex].title;

  $: {
    pendingPage = pendingPage.replace(/[^0-9]/g, "");
  }

  async function handleSectionAdd(callApi = true, newId = null) {
    let alreadyAdded = false;
    if (update) {
      update = false;
      if (pageAsNumber == updatePage) {
        // Same page number: update in place
        await wrapLoadSeparate(
          loading,
          layout,
          async () =>
            await replaceSection(
              viewer.id,
              viewer.sections[updatingIndex].id,
              pageAsNumber,
              pendingTitle
            )
        );
        viewer.sections[updatingIndex] = {
          id: viewer.sections[updatingIndex].id,
          page: pageAsNumber,
          title: pendingTitle,
        };
        viewer.sections = viewer.sections;
        alreadyAdded = true;
      } else {
        // Different page number: remove and add
        const newSection = await wrapLoadSeparate(
          loading,
          layout,
          async () =>
            await replaceSection(
              viewer.id,
              viewer.sections[updatingIndex].id,
              pageAsNumber,
              pendingTitle
            )
        );
        await handleSectionRemove(updatingIndex, false);
        handleSectionAdd(false, newSection.id);
        return;
      }
    }

    if (!alreadyAdded) {
      let id;
      if (callApi) {
        const section = await wrapLoadSeparate(
          loading,
          layout,
          async () => await addSection(viewer.id, pageAsNumber, pendingTitle)
        );
        id = section.id;
      } else {
        id = newId;
      }
      viewer.sections = [
        ...viewer.sections,
        { page: pageAsNumber, title: pendingTitle, id },
      ];
      viewer.sections.sort((a, b) => a.page - b.page);
      viewer.sections = viewer.sections;
    }

    // Reset the inputs
    pendingPage = "";
    pendingTitle = "";
  }

  async function handleSectionRemove(idx, callApi = true) {
    if (callApi) {
      showConfirm(
        "Confirm delete",
        `Proceeding will remove the specified section (p. ${
          viewer.sections[idx].page + 1
        } ${viewer.sections[idx].title}). Do you wish to continue?`,
        "Delete",
        async () => {
          await wrapLoadSeparate(
            loading,
            layout,
            async () => await removeSection(viewer.id, viewer.sections[idx].id)
          );
          handleSectionRemove(idx, false);
        }
      );
    } else {
      const removed = viewer.sections.splice(idx, 1);
      viewer.sections = viewer.sections;
      return removed[0];
    }
  }

  function editSection(idx) {
    updatingIndex = idx;
    const section = viewer.sections[idx];
    pendingPage = `${section.page + 1}`;
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

  function clearAllSections() {}

  $: pageAsNumber = parseInt(pendingPage) - 1;
  $: pageCollided =
    pageAsNumber != null &&
    $viewer.sections.map((section) => section.page).includes(pageAsNumber);
  $: pageSameAsEdit = update && updatePage == pageAsNumber;
  $: titleSameAsEdit = update && updateTitle == pendingTitle;
  $: pageValid =
    $viewer.loaded &&
    pageAsNumber != null &&
    pageAsNumber >= 0 &&
    pageAsNumber < $viewer.document.pageCount &&
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
        background: rgba($annotationBorder, 0.3);
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

<Loader center={true} active={$loading}>
  <div>
    <div class="mcontent">
      <h1>Edit Sections</h1>
      <p>Manage sections to organize your document with a table of contents.</p>

      <!-- Existing TOC -->
      <div class="toc" class:disabled={update}>
        {#if $viewer.sections.length > 0}
          {#each $viewer.sections as section, i}
            <div class="section" class:special={update && updatingIndex == i}>
              <span class="edit" on:click={() => !update && editSection(i)}>
                {@html pencilSvg}
              </span>
              <span
                class="remove"
                on:click={async () => !update && (await handleSectionRemove(i))}>
                {@html closeSimpleSvg}
              </span>
              <span class="page">p. {section.page + 1}</span>
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
            maxlength={sectionTitleLimit}
            class="titleinput"
            type="text"
            placeholder="Title"
            bind:value={pendingTitle} />
          <span class="add">
            <Button
              disabledReason={pageValid ? (titleValid ? null : titleUpdateValid ? 'Please enter a title' : 'Enter a new title or page number') : pageCollided ? 'You must enter a unique page number' : 'Page number is invalid'}
              on:click={handleSectionAdd}>
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
          <Button primary={true} on:click={hideEditSections}>Done</Button>
        </div>
      </div>
    </div>
  </div>
</Loader>
