<script>
  import Button from "@/common/Button";
  import Tooltip from "@/common/Tooltip";
  import HtmlEditor from "@/common/HtmlEditor";
  import { metaDialogs } from "./metaDialogs";
  import { nameSingularNumberPlural } from "@/util/string";
  import { titlecase } from "@/util/string";
  import { editSelectedDocumentInfo } from "@/manager/documents";
  import { viewer } from "@/viewer/viewer";
  import emitter from "@/emit";

  // Stores
  import { layout } from "@/manager/layout";
  import { layout as viewerLayout } from "@/viewer/layout";

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
              : $layout.selected)[0]
          )
        )
      : metaDialogs.map((_) => "");
  let values = initial != null ? initial.slice() : metaDialogs.map((_) => "");

  $: valid = metaDialogs.some((x, i) =>
    (x.fieldValid || fieldValid)(values[i], initial[i])
  );
  $: invalidReason = metaDialogs
    .map((x, i) =>
      (x.fieldInvalidText || fieldInvalidText)(
        values[i],
        initial[i],
        x.fieldName
      )
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
      () => {
        viewer.document.doc = { ...viewer.document.doc, ...fields };
        viewer.document = viewer.document;
      }
    );
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
      Edit information for
      {nameSingularNumberPlural(numSelected, 'document')}
    </h1>
    <table>
      {#each metaDialogs as meta, i}
        {#if meta.disabled == null || !meta.disabled(numSelected)}
          <tr>
            <td>{titlecase(meta.fieldName)}:</td>
            <td>
              <div class="inputpadded">
                {#if meta.isTextArea}
                  <HtmlEditor bind:value={values[i]} />
                {:else}<input bind:value={values[i]} />{/if}
              </div>
            </td>
          </tr>
        {/if}
      {/each}
    </table>
    <div class="buttonpadded">
      {#if valid}
        <Button on:click={applyAction}>Save</Button>
      {:else}
        <Tooltip caption={invalidReason} delay={500}>
          <Button disabled={true}>Save</Button>
        </Tooltip>
      {/if}
      <Button secondary={true} on:click={emit.dismiss}>Cancel</Button>
    </div>
  </div>
</div>
