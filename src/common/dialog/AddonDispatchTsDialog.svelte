<script lang="ts">
    import Button from "@/common/Button";
    import { addons, dispatchAddon } from "@/manager/addons";
    import { search, initSearch } from "@/search/search";
    import { viewer } from "@/viewer/viewer";
    import emitter from "@/emit";
    import { _ } from "svelte-i18n";
  
    // Stores
    import { layout } from "@/manager/layout";
    // import { layout as viewerLayout } from "@/viewer/layout";

    import Ajv from "ajv";
    import { Form, components } from "@pyoner/svelte-form";
    import { createAjvValidator } from "@pyoner/svelte-form-ajv";
  
    const ajv = new Ajv({
      schemaId: "auto",
      jsonPointers: true,
      allErrors: true,
      coerceTypes: true,
    });
  
    const validator = createAjvValidator(ajv);
  
    let schema, value;
  
    schema = layout.addonDispatchOpen.parameters;
    
    /* TODO: internationalize errors as before:
    const fieldValid = (value, initial) => value != initial;
    const fieldInvalidText = (value, initial, fieldName) =>
      value == initial ? `The document already has this ${fieldName}` : "";
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
  */

    const emit = emitter({
      dismiss() {},
    });
  
    $: isViewer = $viewer.document != null;
    $: numSelected = isViewer ? 1 : $layout.numSelected;
    $: selected = isViewer ? [$viewer.document] : $layout.selected;
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
  
      {#if schema}
        <h1>{$_("addonsMenu.addon")}</h1>
        <Form {schema} {components} {value} {validator}
          on:submit={(e) => {
            console.log("submits", e);
            /* for search query, look at paginator for an example*/
            dispatchAddon(
              parseInt(layout.addonDispatchOpen.id, 10),
              e.detail,
              search && search.params && search.params.params && search.params.params.q,
              selected,
            );
            emit.dismiss();
          }}
          on:reset={(e) => {
            console.log("reset", e);
          }}
          >
          <div class="buttonpadded">
              <!-- disable button when invalid, maybe -->
            <Button secondary={true} type="reset">Reset</Button>
            <Button type="submit">{$_("dialog.dispatch")}</Button>
            <Button secondary={true} on:click={emit.dismiss}
              >{$_("dialog.cancel")}</Button
            >
          </div>
        </Form>
  
      {/if}
      <!-- <div class="buttonpadded">
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
      </div> -->
    </div>
  </div>
