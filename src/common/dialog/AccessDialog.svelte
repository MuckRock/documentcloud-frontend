<script>
  import Button from "@/common/Button";
  import { layout } from "@/manager/layout";
  import { layout as viewerLayout } from "@/viewer/layout";
  import { viewer } from "@/viewer/viewer";
  import { wrapLoad } from "@/util/wrapLoad";
  import { editMetadata } from "@/api/document";
  import {
    changeAccessForDocuments,
    updateInCollection,
  } from "@/manager/documents";
  import { nameSingularNumberPlural } from "@/util/string";
  import emitter from "@/emit";
  import Flatpickr from "svelte-flatpickr";
  import "flatpickr/dist/flatpickr.css";

  const emit = emitter({
    dismiss() {},
  });

  let access =
    $viewer.document != null ? $viewer.document.access : $layout.defaultAccess;

  let publishAt =
    $viewer.document != null
      ? $viewer.document.publishAt
      : $layout.samePublishAt;
  let publishAtFormatted = publishAt;

  const flatpickrOptions = {
    enableTime: true,
    minDate: "today",
    altInput: true,
    dateFormat: "Z",
  };

  $: isViewer = $viewer.document != null;
  $: valid = isViewer
    ? access != viewer.document.access || publishAt != viewer.document.publishAt
    : access != $layout.sameAccess || publishAt != $layout.samePublishAt;
  $: numAccessSelected = isViewer ? 1 : $layout.numAccessSelected;

  async function accessChange(access, publishAt) {
    if (!valid) return;
    if (isViewer) {
      await wrapLoad(viewerLayout, async () => {
        await editMetadata([viewer.document.id], {
          access,
          publish_at: publishAt,
        });
        viewer.document.doc = {
          ...viewer.document.doc,
          status: "readable",
          publish_at: publishAt,
        };
        viewer.document = viewer.document;
        updateInCollection(
          viewer.document,
          (d) =>
            (d.doc = { ...d.doc, status: "readable", publish_at: publishAt }),
        );
      });
    } else {
      changeAccessForDocuments(
        layout.accessEditDocuments,
        access,
        publishAt,
        layout,
      );
    }
    emit.dismiss();
  }
</script>

<style lang="scss">
  label {
    display: table;
    margin: 12px 0;
  }

  input {
    display: table-cell;
  }

  p {
    margin: 0 0 10px 0;
  }

  .accessoption {
    display: table-cell;
    padding-left: 10px;
  }

  h3 {
    font-size: 16px;
    margin: 0;
  }

  small {
    margin: 5px 0;
  }

  .publishat {
    margin-top: 36px;
  }
</style>

<div>
  <div class="mcontent">
    <h1>
      Change access for
      {nameSingularNumberPlural(numAccessSelected, "document")}
    </h1>
    <p>
      Select an access level below for the
      {nameSingularNumberPlural(numAccessSelected, "selected document")}:
    </p>
    <div class="inputpadded">
      <label>
        <input type="radio" bind:group={access} value={"public"} />
        <div class="accessoption">
          <h3>Public access</h3>
          <small>
            Anyone on the internet can search for and view the document.
          </small>
        </div>
      </label>
      <label>
        <input type="radio" bind:group={access} value={"private"} />
        <div class="accessoption">
          <h3>Private access</h3>
          <small>
            Only people with explicit permission (via collaboration) have
            access.
          </small>
        </div>
      </label>
      <label>
        <input type="radio" bind:group={access} value={"organization"} />
        <div class="accessoption">
          <h3>Private to your organization</h3>
          <small>Only the people in your organization have access.</small>
        </div>
      </label>
      {#if access != "public"}
        <div class="publishat">
          <div class="accessoption">
            <h3>Set a future date to publish at</h3>
            <small
              >This document will be made public at the given date and time.</small
            >
            <div>
              <Flatpickr
                options={flatpickrOptions}
                bind:formattedValue={publishAtFormatted}
                bind:value={publishAt}
                name="date"
              />
            </div>
          </div>
        </div>
      {/if}
    </div>
    <div class="buttonpadded">
      <Button
        disabledReason={valid
          ? null
          : `Access is already set to ${$layout.sameAccess}. Select a different access level.`}
        on:click={() => accessChange(access, publishAt)}
      >
        Change access
      </Button>
      <Button secondary={true} on:click={emit.dismiss}>Cancel</Button>
    </div>
  </div>
</div>
