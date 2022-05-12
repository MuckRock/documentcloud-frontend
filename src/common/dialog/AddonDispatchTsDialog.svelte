<script lang="ts">
  import Button from "@/common/Button";
  import { dispatchAddon } from "@/manager/addons";
  import {
    createAddonEvent,
    getAddonEvents,
    updateAddonEvent,
  } from "@/api/addon";
  import { search, initSearch } from "@/search/search";
  import { viewer } from "@/viewer/viewer";
  import emitter from "@/emit";
  import { _ } from "svelte-i18n";
  import SvelteMarkdown from "svelte-markdown";

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

  let eventSelect = "0";
  let events = [];
  let activeEvent = null;
  let schema = structuredClone(layout.addonDispatchOpen.parameters);

  async function showEvents(e) {
    e.preventDefault();
    events = await getAddonEvents(layout.addonDispatchOpen.id);
  }

  async function hideEvents(e) {
    e.preventDefault();
    events = [];
    activeEvent = null;
    eventSelect = "0";
    schema = structuredClone(layout.addonDispatchOpen.parameters);
    document.getElementById("form").closest("form").reset();
  }

  function loadEvent(event) {
    // set the active event
    activeEvent = event;
    // update the defaults to set the values in the form
    for (const param in event.parameters) {
      schema.properties[param].default = event.parameters[param];
    }
    document.getElementById("form").closest("form").reset();
    // set the event select widget
    eventSelect = event.event.toString();
  }

  const ajv = new Ajv({
    schemaId: "auto",
    jsonPointers: true,
    allErrors: true,
    coerceTypes: true,
  });

  const validator = createAjvValidator(ajv);

  let value;

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

  .notice :global(a),
  .markdown :global(a) {
    text-decoration: underline;
    color: $primary;
  }

  .eventSelect {
    label {
      font-size: 16px;
      padding-right: 5px;
    }
  }
</style>

<div>
  <div class="mcontent">
    {#if schema}
      <h1>
        {$_("addonsMenu.addon")}: {layout.addonDispatchOpen.name}
        <span id="repository-detail">
          by {layout.addonDispatchOpen.repository.split("/")[0]}
          <a
            target="_blank"
            href="https://www.github.com/{layout.addonDispatchOpen.repository}"
          >
            (View Source)
          </a>
        </span>
      </h1>

      {#if activeEvent}
        <h2>Edit Event #{activeEvent.id}</h2>
      {/if}

      <div class="markdown">
        <SvelteMarkdown
          source={schema.description}
          renderers={{ html: null }}
        />
      </div>

      <Form
        {schema}
        {components}
        {value}
        {validator}
        on:submit={(e) => {
          if (activeEvent) {
            updateAddonEvent(activeEvent.id, e.detail, eventSelect);
          } else if (eventSelect === "0") {
            // no event, dispatch immediately
            dispatchAddon(
              parseInt(layout.addonDispatchOpen.id, 10),
              e.detail,
              includeQuery ? query : "",
              includeDocuments ? selected : [],
            );
          } else {
            createAddonEvent(
              parseInt(layout.addonDispatchOpen.id, 10),
              e.detail,
              eventSelect,
            );
          }
          emit.dismiss();
        }}
      >
        <a id="form" />
        {#if notice}
          <div class="notice">{@html notice}</div>
        {/if}
        {#if showQuery && showDocuments}
          <table class="documents">
            <tbody>
              <tr class="field">
                <td class="radio">
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
                </td>
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

        {#if !hasQueryProp && !hasDocumentsProp}
          <div class="eventSelect">
            <label class="label">Run on a schedule:</label>
            <span class="inputpadded">
              <select bind:value={eventSelect}>
                <option value="0"
                  >{#if activeEvent}Disable{:else}---{/if}</option
                >
                <option value="1">Hourly</option>
                <option value="2">Daily</option>
                <option value="3">Weekly</option>
              </select>
            </span>
          </div>
        {/if}

        {#if events.length > 0}
          <div class="events">
            <ul>
              {#each events as event}
                <li>
                  <a href="#" on:click={() => loadEvent(event)}>
                    Event #{event.id}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
          <Button nondescript={true} on:click={hideEvents}>Hide Events</Button>
        {:else}
          <Button nondescript={true} on:click={showEvents}>Show Events</Button>
        {/if}

        <div class="buttonpadded">
          <!-- disable button when invalid, maybe -->
          <Button type="submit">
            {eventSelect === "0" && !activeEvent
              ? $_("dialog.dispatch")
              : $_("dialog.save")}
          </Button>
          <Button secondary={true} on:click={emit.dismiss}>
            {$_("dialog.cancel")}
          </Button>
        </div>
      </Form>
    {/if}
  </div>
</div>
