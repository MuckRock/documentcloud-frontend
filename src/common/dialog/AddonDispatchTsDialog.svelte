<script lang="ts">
  import Button from "@/common/Button";
  import { addons, dispatchAddon } from "@/manager/addons";
  import { search, initSearch } from "@/search/search";
  import { viewer } from "@/viewer/viewer";
  import emitter from "@/emit";
  import { _ } from "svelte-i18n";

  // Stores
  import { layout } from "@/manager/layout";

  import Ajv from "ajv";
  import { components } from "./DCDefaultFormComponents";
  import { Form } from "@pyoner/svelte-form";
  import { createAjvValidator } from "@pyoner/svelte-form-ajv";

  function findType(schema, type) {
    for (const [key, value] of Object.entries(schema)) {
      if (value.type === type) return true;
    }
  }

  const ajv = new Ajv({
    schemaId: "auto",
    jsonPointers: true,
    allErrors: true,
    coerceTypes: true,
  });

  const validator = createAjvValidator(ajv);

  let value;

  let schema = layout.addonDispatchOpen.parameters;

  const emit = emitter({
    dismiss() {},
  });

  $: isViewer = $viewer.document != null;
  $: numSelected = isViewer ? 1 : $layout.numSelected;
  $: selected = isViewer ? [$viewer.document] : $layout.selected;

  console.log(schema);
  let hasQueryProp =
    Array.isArray(schema.documents) && schema.documents.includes("query");
  let hasDocumentsProp =
    Array.isArray(schema.documents) && schema.documents.includes("selected");
  let hasSelectedDocs = $layout.selected.length > 0;
  let showQuery = hasQueryProp;
  let showDocuments = hasDocumentsProp && (!hasQueryProp || hasSelectedDocs);
  let warning =
    !hasQueryProp && hasDocumentsProp && !hasSelectedDocs
      ? "You must select some documents to run this add-on"
      : hasQueryProp && hasDocumentsProp && !hasSelectedDocs
      ? "You may select some documents to use for this add-on instead of submitting the query"
      : "";

  let docType = "documents";
  $: includeQuery = showQuery && (!showDocuments || docType === "query");
  $: includeDocuments =
    showDocuments && (!showQuery || docType === "documents");

  let query =
    search && search.params && search.params.params && search.params.params.q;
</script>

<style lang="scss">
  #repository-detail {
    font-size: 16px;
    font-weight: normal;

    a {
      text-decoration: underline;
    }
  }

  table {
    position: border-box;
    width: 100%;
    font-size: 16px;
    font-family: inherit;
  }

  table :global(input) {
    position: border-box;
    width: 100%;
    font-size: 16px;
    font-family: inherit;
  }

  table :global(input.radio) {
    width: auto;
  }

  td:first-child,
  td:nth-child(2) {
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

      <div class="inputpadded">
        <div class="description">{schema.description}</div>
      </div>

      {#if showQuery || showDocuments}
        <table>
          {#if warning}
            <thead><tr><td colspan="3"><em>{warning}</em></td></tr></thead>
          {/if}
          <tbody>
            {#if showDocuments}
              <tr class="field">
                <td><label for="documents" class="label">Documents:</label></td>
                {#if showQuery}
                  <td>
                    <div class="inputpadded">
                      <input
                        type="radio"
                        class="radio"
                        name="documents"
                        id="documents"
                        bind:group={docType}
                        value="documents"
                        checked
                      />
                    </div>
                  </td>
                {/if}
                <td>
                  <div class="inputpadded">
                    <label for="documents">
                      Include {selected.length} selected documents
                    </label>
                  </div>
                </td>
              </tr>
            {/if}
            {#if showQuery}
              <tr class="field">
                <td><label for="query" class="label">Query:</label></td>
                {#if showDocuments}
                  <td>
                    <div class="inputpadded">
                      <input
                        type="radio"
                        class="radio"
                        name="documents"
                        id="query"
                        bind:group={docType}
                        value="query"
                      />
                    </div>
                  </td>
                {/if}
                <td>
                  <div class="inputpadded">
                    <label for="query">
                      {query}
                    </label>
                  </div>
                </td>
              </tr>
            {/if}
          </tbody>
        </table>
      {/if}

      <Form
        {schema}
        {components}
        {value}
        {validator}
        on:submit={(e) => {
          /* for search query, look at paginator for an example*/
          dispatchAddon(
            parseInt(layout.addonDispatchOpen.id, 10),
            e.detail,
            includeQuery ? query : "",
            includeDocuments ? selected : [],
          );
          emit.dismiss();
        }}
      >
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
