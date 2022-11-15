<script>
  import Button from "@/common/Button";
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
  import emitter from "@/emit";
  import Calendar from "@/common/Calendar";
  import { _ } from "svelte-i18n";

  // SVG assets
  import InfoSvg from "@/assets/info.svg";
  import CalendarSvg from "@/assets/calendar.svg";

  const emit = emitter({
    dismiss() {},
  });

  // Cannot use dynamic isViewer since reactive properties initialized after static ones
  let access =
    $viewer.document != null ? $viewer.document.access : $layout.defaultAccess;
  let noindex =
    $viewer.document != null ? $viewer.document.noindex : $layout.defaultNoindex;

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
      ? access !== viewer.document.access ||
        publishAt !== viewer.document.publishAt ||
        noindex !== viewer.document.noindex
      : access !== $layout.sameAccess ||
      publishAt !== $layout.samePublishAt ||
      noindex !== $layout.sameNoindex
      );
  $: numAccessSelected = isViewer ? 1 : $layout.numAccessSelected;
  $: notVerified = isViewer ? !$viewer.isVerified : !$orgsAndUsers.isVerified;

  $: accessDocs = isViewer ? [$viewer.document] : $layout.accessEditDocuments;
  $: oneIndividual =
    accessDocs.filter(
      (x) => x.organization != null && x.organization.individual,
    ).length > 0;

  async function accessChange(access, publishAt, noindex) {
    if (!valid) return;
    if (isViewer) {
      await wrapLoad(viewerLayout, async () => {
        await editMetadata([viewer.document.id], {
          access,
          publish_at: publishAt,
          noindex
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
            (d.doc = { ...d.doc, status: "readable", publish_at: publishAt, noindex }),
        );
      });
    } else {
      changeAccessForDocuments(
        layout.accessEditDocuments,
        access,
        publishAt,
        layout,
        noindex
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

  .normal-label {
    display: initial;
    margin-left: 8px;
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

  .faded {
    opacity: 0.3;
    pointer-events: none;
  }

  .callout {
    border: solid 2px $primary;
    background: $menuBg;
    border-radius: 5px;
    padding: 4px 8px;
    font-size: 13px;
    margin-left: 28px;
    position: relative;
    margin-bottom: 16px;

    :global(a) {
      color: $primary;
    }

    .i {
      position: absolute;
      top: 0;
      left: 0;
      padding: 6px 4px;

      :global(svg) {
        width: 15px;
        height: 15px;
      }
    }

    .content {
      padding-left: 14px;
      display: inline-block;
    }
  }
</style>

<div>
  <div class="mcontent">
    <h1>
      {$_("dialogAccessDialog.changeAccess", {
        values: { n: numAccessSelected },
      })}
    </h1>
    <p>
      {$_("dialogAccessDialog.selectAccess", {
        values: { n: numAccessSelected },
      })}
    </p>
    <div class="inputpadded">
      <label class:faded={notVerified}>
        <input
          type="radio"
          bind:group={access}
          value={"public"}
          disabled={notVerified}
        />
        <div class="accessoption">
          <h3>{$_("dialogAccessDialog.public")}</h3>
          <small>{$_("dialogAccessDialog.publicDesc")}</small>
        </div>
      </label>
      {#if notVerified}
        <div class="callout">
          <span class="i">{@html InfoSvg}</span>
          <span class="content">
            {@html $_("dialogAccessDialog.verifiedHelp")}
          </span>
        </div>
      {/if}
      <label>
        <input type="radio" bind:group={access} value={"private"} />
        <div class="accessoption">
          <h3>{$_("dialogAccessDialog.private")}</h3>
          <small>{$_("dialogAccessDialog.privateDesc")}</small>
        </div>
      </label>
      <label class:faded={oneIndividual}>
        <input type="radio" bind:group={access} value={"organization"} />
        <div class="accessoption">
          <h3>{$_("dialogAccessDialog.organization")}</h3>
          <small>{$_("dialogAccessDialog.organizationDesc")}</small>
        </div>
      </label>
      {#if oneIndividual}
        <div class="callout">
          <span class="i">{@html InfoSvg}</span>
          <span class="content">
            {@html $_("dialogAccessDialog.privateToOrg", {
              values: { n: accessDocs.length },
            })}
          </span>
        </div>
      {/if}

      {#if access != "public" && !notVerified}
        <div class="scheduler">
          <div class="scheduleaction">
            <label
              ><input
                type="checkbox"
                bind:checked={showScheduler}
                disabled={notVerified}
              />
              <span class="icon">{@html CalendarSvg}</span>
              {$_("dialogAccessDialog.schedulePublication")}</label
            >
          </div>
          {#if showScheduler}
            <small>
              {$_("dialogAccessDialog.scheduleHelp", {
                values: { timezone: timezone != null ? ` (${timezone})` : "" },
              })}
            </small>
            <Calendar bind:value={publishAt} />
          {/if}
        </div>
      {/if}
    </div>
    <div>
      <input class="hide-from-search-checkbox" type="checkbox" bind:checked={noindex} />
      <label class="normal-label">
        Hide from search engines and DocumentCloud search?
      </label>
    </div>
    <div class="buttonpadded">
      <Button
        disabledReason={valid
          ? null
          : validPublishAt
          ? $_("dialogAccessDialog.unchanged")
          : $_("dialogAccessDialog.future")}
        on:click={() => accessChange(access, publishAt, noindex)}
      >
        {$_("dialogAccessDialog.change")}
      </Button>
      <Button secondary={true} on:click={emit.dismiss}
        >{$_("dialog.cancel")}</Button
      >
    </div>
  </div>
</div>
