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
  import {components} from "./DCDefaultFormComponents"
   import { Form /*, components*/  } from "@pyoner/svelte-form";
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

  const emit = emitter({
    dismiss() {},
  });

  $: isViewer = $viewer.document != null;
  $: numSelected = isViewer ? 1 : $layout.numSelected;
  $: selected = isViewer ? [$viewer.document] : $layout.selected;
</script>

<style lang="scss">

  #repository-detail {
      font-size: 16px;
      font-weight: normal;

      a {
        text-decoration: underline;
      }
  }
</style>

<div>
  <div class="mcontent">

    {#if schema}
      <h1>
        {$_("addonsMenu.addon")}: {layout.addonDispatchOpen.name}
        <span id="repository-detail">
          by MuckRock
          <a
            target="_blank"
            href="https://www.github.com/{layout.addonDispatchOpen.repository}"
          >
            (View Source)
          </a>
        </span>
      </h1>
      <Form
        {schema}
        {components}
        {value}
        {validator}
        on:submit={(e) => {
          console.log("submits", e);
          /* for search query, look at paginator for an example*/
          dispatchAddon(
            parseInt(layout.addonDispatchOpen.id, 10),
            e.detail,
            search &&
              search.params &&
              search.params.params &&
              search.params.params.q,
            selected,
          );
          emit.dismiss();
        }}
        on:reset={(e) => {
          console.log("reset", e);
        }}
      >
      <div class="form-group"></div>
        <div class="buttonpadded">

          <!-- disable button when invalid, maybe -->
          <Button type="submit">{$_("dialog.dispatch")}</Button>
          <Button secondary={true} on:click={emit.dismiss}
            >{$_("dialog.cancel")}</Button
          >
        </div>
      </Form>
    {/if}
  </div>
</div>
