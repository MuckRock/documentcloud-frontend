<script lang="ts">
  import Button from "@/common/Button";
  import { dispatchAddon } from "@/manager/addons";
  import { search, initSearch } from "@/search/search";
  import { viewer } from "@/viewer/viewer";
  import emitter from "@/emit";
  import { _ } from "svelte-i18n";
  import SvelteMarkdown from 'svelte-markdown'

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

  let isViewer = $viewer.document != null;
  let numSelected = isViewer ? 1 : $layout.numSelected;
  let selected = isViewer ? [$viewer.document] : $layout.selected;

  let hasQueryProp =
    Array.isArray(schema.documents) && schema.documents.includes("query");
  let hasDocumentsProp =
    Array.isArray(schema.documents) && schema.documents.includes("selected");
  let hasSelectedDocs = numSelected > 0;

  let showQuery = hasQueryProp;
  let showDocuments = hasDocumentsProp && (!hasQueryProp || hasSelectedDocs);

  let notice =
    hasQueryProp && hasDocumentsProp && hasSelectedDocs
      ? $_("addonDispatchDialog.select")
      : hasQueryProp && hasDocumentsProp && !hasSelectedDocs
      ? $_("addonDispatchDialog.queryNoSelected", {
          values: { n: search.results.count },
        }) +
        " " +
        $_("addonDispatchDialog.learnMore")
      : !hasQueryProp && hasDocumentsProp && !hasSelectedDocs
      ? $_("addonDispatchDialog.noSelected") +
        " " +
        $_("addonDispatchDialog.learnMore")
      : !hasQueryProp && hasDocumentsProp && hasSelectedDocs
      ? $_("addonDispatchDialog.runSelected", {
          values: { n: numSelected },
        }) +
        " " +
        $_("addonDispatchDialog.learnMore")
      : hasQueryProp && !hasDocumentsProp
      ? $_("addonDispatchDialog.runQuery", {
          values: { n: search.results.count },
        }) +
        " " +
        $_("addonDispatchDialog.learnMore")
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
    width: 100%;
    font-size: 16px;
    font-family: inherit;
    table-layout: fixed;
    word-wrap: break-word;
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

  td:first-child {
    white-space: nowrap;
    padding-right: 5px;
  }

  td.radio {
    width: 1rem;
  }

  td:last-child {
    width: 100%;
    position: relative;
  }

  .notice :global(a) {
    text-decoration: underline;
    color: $primary;
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

      <div>
        <SvelteMarkdown source={schema.description} renderers={{html: null}} />
      </div>

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
        {#if notice}
          <div class="notice">{@html notice}</div>
        {/if}
        {#if showQuery && showDocuments}
          <table class="documents">
            <tbody>
              <tr class="field">
                <td class="radio">
                  <div>
                    <div>
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
                  </div></td
                >
                <td>
                  <div>
                    <label for="documents">
                      {$_("addonDispatchDialog.labelSelected", {
                        values: { n: numSelected },
                      })}
                    </label>
                  </div>
                </td>
              </tr>
              <tr class="field">
                <td class="radio">
                  <div>
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
                <td>
                  <div>
                    <label for="query">
                      {$_("addonDispatchDialog.labelQuery", {
                        values: { n: search.results.count },
                      })}
                    </label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        {/if}

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
