<script>
  import { _ } from "svelte-i18n";

  import Button from "@/common/Button.svelte";
  import Tooltip from "../lib/components/common/Tooltip.svelte";
  import HtmlEditor from "@/common/HtmlEditor.svelte";

  import { metaDialogs } from "./metaDialogs.js";
  import { editSelectedDocumentInfo } from "@/manager/documents.js";
  import { viewer } from "@/viewer/viewer.js";
  import emitter from "@/emit.js";

  // Stores
  import { layout } from "@/manager/layout.js";
  import { layout as viewerLayout } from "@/viewer/layout.js";

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
      ? metaDialogs.map((x) =>
          x.fieldAccessor(
            ($viewer.document != null
              ? [$viewer.document]
              : $layout.selected)[0],
          ),
        )
      : metaDialogs.map((_) => "");
  let values = initial != null ? initial.slice() : metaDialogs.map((_) => "");

  $: valid = metaDialogs.some((x, i) =>
    (x.fieldValid || fieldValid)(values[i], initial[i]),
  );
  $: invalidReason = metaDialogs
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

  function applyAction() {
    if (!valid) return;

    const fields = {};
    for (let i = 0; i < metaDialogs.length; i++) {
      const meta = metaDialogs[i];
      if ((meta.fieldValid || fieldValid)(values[i], initial[i])) {
        fields[meta.apiField] = values[i];
      }
    }
    editSelectedDocumentInfo(
      fields,
      isViewer ? viewerLayout : layout,
      selected,
      isViewer
        ? () => {
            viewer.document.doc = { ...viewer.document.doc, ...fields };
            viewer.document = viewer.document;
          }
        : () => {},
    );
    emit.dismiss();
  }
</script>

<div class="mcontent">
  <h2>
    {$_("dialogDocumentInformationDialog.editInformation", {
      values: { n: numSelected },
    })}
  </h2>
  <table>
    {#each metaDialogs as meta, i}
      {#if meta.disabled == null || !meta.disabled(numSelected)}
        <tr>
          <td>{$_(meta.fieldNameUppercase)}:</td>
          <td>
            <div class="inputpadded">
              {#if meta.isTextArea}
                <HtmlEditor maxlength={meta.charLimit} bind:value={values[i]} />
              {:else}
                <input maxlength={meta.charLimit} bind:value={values[i]} />
              {/if}
            </div>
          </td>
        </tr>
      {/if}
    {/each}
  </table>
  <div class="buttonpadded">
    {#if valid}
      <Button on:click={applyAction}>{$_("dialog.save")}</Button>
    {:else}
      <Tooltip caption={invalidReason} delay={500}>
        <Button disabled={true}>{$_("dialog.save")}</Button>
      </Tooltip>
    {/if}
    <Button secondary={true} on:click={emit.dismiss}
      >{$_("dialog.cancel")}</Button
    >
  </div>
</div>

<style>
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
