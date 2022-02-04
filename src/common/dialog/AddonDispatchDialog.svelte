<script>
  import Button from "@/common/Button";
  import Tooltip from "@/common/Tooltip";
  import HtmlEditor from "@/common/HtmlEditor";
  import { addonDialogs } from "./addonDialogs";
  import { nameSingularNumberPlural } from "@/util/string";
  import { titlecase } from "@/util/string";
  import {dispatchAddon} from "@/manager/addons"
  // import { editSelectedDocumentInfo } from "@/manager/documents";
  import { viewer } from "@/viewer/viewer";
  import emitter from "@/emit";
  import { _ } from "svelte-i18n";

  // Stores
  import { layout } from "@/manager/layout";
  import { layout as viewerLayout } from "@/viewer/layout";
import ActionBar from "../../pages/app/ActionBar.svelte";

  const fieldValid = (value, initial) => value != initial;
  const fieldInvalidText = (value, initial, fieldName) =>
    value == initial ? `The document already has this ${fieldName}` : "";

  const emit = emitter({
    dismiss() {},
  });

  $: isViewer = $viewer.document != null;
  $: numSelected = isViewer ? 1 : $layout.numSelected;
  $: selected = isViewer ? [$viewer.document] : $layout.selected;

  const initial =
    ($viewer.document != null ? 1 : $layout.numSelected) == 1
      ? addonDialogs.map((x) =>
          x.fieldAccessor(
            ($viewer.document != null
              ? [$viewer.document]
              : $layout.selected)[0],
          ),
        )
      : addonDialogs.map((_) => "");
  let values = initial != null ? initial.slice() : addonDialogs.map((_) => "");

  $: valid = addonDialogs.some((x, i) =>
    (x.fieldValid || fieldValid)(values[i], initial[i]),
  );
  $: invalidReason = addonDialogs
    .map((x, i) =>
      $_(
        (x.fieldInvalidText || fieldInvalidText)(
          values[i],
          initial[i],
          x.fieldName,
        ),
        {
          values: { fieldName: $_(x.fieldName) },
        },
      ),
    )
    .join(", ");

  async function applyAction() {
    if (!valid) return;

    const fields = {};
    for (let i = 0; i < addonDialogs.length; i++) {
      const addonField = addonDialogs[i];
      if ((addonField.fieldValid || fieldValid)(values[i], initial[i])) {
        fields[addonField.apiField] = values[i];
      }
    }
    console.log("MAKE SURE TO CHANGE THIS FROM 1")
    dispatchAddon(
      1,
      fields,
      isViewer ? viewerLayout : layout,
      selected,
      isViewer
        ? () => {
            viewer.document.doc = { ...viewer.document.doc, ...fields };
            viewer.document = viewer.document;
          }
        : () => {}
    );
    // editSelectedDocumentInfo(
    //   fields,
    //   isViewer ? viewerLayout : layout,
    //   selected,
    //   isViewer
    //     ? () => {
    //         viewer.document.doc = { ...viewer.document.doc, ...fields };
    //         viewer.document = viewer.document;
    //       }
    //     : () => {},
    // );
    emit.dismiss();
  }
</script>

<style lang="scss">
  input,
  table {
    position: border-box;
    width: 100%;
    font-size: 16px;
    font-family: inherit;
  }

  td:first-child {
    white-space: nowrap;
    padding-right: 5px;
  }

  td:last-child {
    width: 100%;
    position: relative;
  }
</style>

<div>
  <div class="mcontent">
    <h1>
      {$_("dialogAddonDispatchDialog.setAddonParameters", {
        values: { n: numSelected },
      })}
    </h1>
    <table>
      {#each addonDialogs as addonField, i}
        {#if addonField.disabled == null || !addonField.disabled(numSelected)}
          <tr>
            <td>{$_(addonField.fieldNameUppercase)}:</td>
            <td>
              <div class="inputpadded">
                {#if addonField.isTextArea}
                  <HtmlEditor
                    maxlength={addonField.charLimit}
                    bind:value={values[i]}
                  />
                {:else}
                  <input maxlength={addonField.charLimit} bind:value={values[i]} />
                {/if}
              </div>
            </td>
          </tr>
        {/if}
      {/each}
    </table>
    <div class="buttonpadded">
      {#if valid}
        <Button on:click={applyAction}>{$_("dialog.dispatch")}</Button>
      {:else}
        <Tooltip caption={invalidReason} delay={500}>
          <Button disabled={true}>{$_("dialog.dispatch")}</Button>
        </Tooltip>
      {/if}
      <Button secondary={true} on:click={emit.dismiss}
        >{$_("dialog.cancel")}</Button
      >
    </div>
  </div>
</div>
