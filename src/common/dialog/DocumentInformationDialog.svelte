<script>
  import Button from "@/common/Button";
  import Tooltip from "@/common/Tooltip";
  import HtmlEditor from "@/common/HtmlEditor";
  import { metaDialogs } from "./metaDialogs";
  import { simplePlural } from "@/util/string";
  import { titlecase } from "@/util/string";
  import { editSelectedDocumentInfo } from "@/manager/documents";
  import emitter from "@/emit";

  // Stores
  import { layout } from "@/manager/layout";

  const fieldValid = (value, initial) => value != initial;
  const fieldInvalidText = (value, initial, fieldName) =>
    value == initial ? `The document already has this ${fieldName}` : "";

  const emit = emitter({
    dismiss() {},
  });

  const initial =
    $layout.numSelected == 1
      ? metaDialogs.map((x) => x.fieldAccessor($layout.selected[0]))
      : metaDialogs.map((_) => "");
  let values = initial != null ? initial.slice() : metaDialogs.map((_) => "");
  $: console.log({ values, initial });

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
    editSelectedDocumentInfo(fields);
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
      {simplePlural($layout.numSelected, 'document')}
    </h1>
    <table>
      {#each metaDialogs as meta, i}
        {#if meta.disabled == null || !meta.disabled($layout.numSelected)}
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
