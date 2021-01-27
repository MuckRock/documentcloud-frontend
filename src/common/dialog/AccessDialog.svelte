<script>
  import Button from "@/common/Button";
  import Tooltip from "@/common/Tooltip";
  import { layout } from "@/manager/layout";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";
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
  import Calendar from "@/common/Calendar";

  // SVG assets
  import CalendarSvg from "@/assets/calendar.svg";

  const emit = emitter({
    dismiss() {},
  });

  let access =
    $viewer.document != null ? $viewer.document.access : $layout.defaultAccess;

  function getTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      return null;
    }
  }

  const timezone = getTimezone();

  function dateFromPublishAt(d) {
    if (d == null) return null;
    return new Date(d);
  }

  let publishAt =
    $viewer.document != null
      ? dateFromPublishAt($viewer.document.publishAt)
      : dateFromPublishAt($layout.samePublishAt);
  let showScheduler = publishAt != null;

  $: {
    if (!showScheduler) publishAt = null;
  }

  $: isViewer = $viewer.document != null;
  $: validPublishAt = publishAt == null || publishAt > new Date();
  $: valid =
    validPublishAt &&
    (isViewer
      ? access != viewer.document.access ||
        publishAt != viewer.document.publishAt
      : access != $layout.sameAccess || publishAt != $layout.samePublishAt);
  $: numAccessSelected = isViewer ? 1 : $layout.numAccessSelected;
  $: notVerified = !$orgsAndUsers.isVerified;

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

  .scheduler {
    margin-top: 24px;

    .scheduleaction {
      @include buttonLike;
      font-size: 14px;
      font-weight: bold;

      input,
      label {
        cursor: pointer;
      }

      .icon {
        display: inline-block;
        vertical-align: middle;

        :global(svg) {
          height: 21px;
        }
      }
    }
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
      <Tooltip
        delay={500}
        show={notVerified}
        caption="You must be a verified journalist to publically publish a document"
      >
        <label>
          <input
            type="radio"
            bind:group={access}
            value={"public"}
            disabled={notVerified}
          />
          <div class="accessoption">
            <h3>Public access</h3>
            <small>
              Anyone on the internet can search for and view the document.
            </small>
          </div>
        </label>
      </Tooltip>
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
        <Tooltip
          delay={500}
          show={notVerified}
          caption="You must be a verified journalist to publically publish a document"
        >
          <div class="scheduler">
            <div class="scheduleaction">
              <label
                ><input
                  type="checkbox"
                  bind:checked={showScheduler}
                  disabled={notVerified}
                />
                <span class="icon">{@html CalendarSvg}</span> Schedule publication</label
              >
            </div>
            {#if showScheduler}
              <small
                >This document will be made public at the given date and time.
                Publication time is local{#if timezone != null}
                  &nbsp({timezone}){/if}.</small
              >
              <Calendar bind:value={publishAt} />
            {/if}
          </div>
        </Tooltip>
      {/if}
    </div>
    <div class="buttonpadded">
      <Button
        disabledReason={valid
          ? null
          : validPublishAt
          ? `Access is unchanged. Select a different access level.`
          : "Must select a time in the future"}
        on:click={() => accessChange(access, publishAt)}>Change access</Button
      >
      <Button secondary={true} on:click={emit.dismiss}>Cancel</Button>
    </div>
  </div>
</div>
