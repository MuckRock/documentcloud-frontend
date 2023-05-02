<script>
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import SvelteMarkdown from "svelte-markdown";
  import Ajv from "ajv";
  import { Form } from "@pyoner/svelte-form";
  import { createAjvValidator } from "@pyoner/svelte-form-ajv";

  import Button from "@/common/Button.svelte";
  import AddonRun from "@/common/AddonRun.svelte";

  import { setHash } from "@/router/router.js";
  import { dispatchAddon } from "@/manager/addons.js";
  import { orgsAndUsers } from "@/manager/orgsAndUsers.js";
  import {
    createAddonEvent,
    getAddonEvents,
    getAddonRuns,
    updateAddonEvent,
  } from "@/api/addon.js";
  import { SIGN_IN_URL } from "@/api/auth.js";
  import { search } from "@/search/search.js";
  import { viewer } from "@/viewer/viewer.js";
  import emitter from "@/emit.js";

  // Stores
  import { layout } from "@/manager/layout.js";
  import { components } from "./DCDefaultFormComponents.ts";

  let container;
  let schema = structuredClone(layout.addonDispatchOpen.parameters);

  // The bind value for the event select drop down
  let eventSelect = 0;
  // The existing events for this add-on for this user
  let events = [];
  // whether or not events are currently displayed
  let showExistingEvents = false;
  // The event actively selected for editing
  let activeEvent = null;
  // The runs for the active event
  let runs = [];
  // which field to use as the name for an event
  let eventNameField = schema.eventOptions && schema.eventOptions.name;
  // The available options for event select drop down
  const availableOptions = [
    [1, "Hourly"],
    [2, "Daily"],
    [3, "Weekly"],
    [4, "Upload"],
  ];
  let eventSelectOptions = [];
  if (schema.eventOptions && schema.eventOptions.events) {
    eventSelectOptions = availableOptions.filter(([value, label]) =>
      schema.eventOptions.events.includes(label.toLowerCase()),
    );
  }
  let showEventInfo = eventSelectOptions.length > 0;

  onMount(async () => {
    events = await getAddonEvents(layout.addonDispatchOpen.id);

    // load initial value from querystring
    value = valuesFromQS();
  });

  // extract initial form values from querystring
  function valuesFromQS() {
    let qs = new URLSearchParams(window.location.search);

    // only accept values in properties
    qs = Array.from(qs).filter(([k, v]) => schema.properties.hasOwnProperty(k));
    return Object.fromEntries(qs);
  }

  async function showRuns(e) {
    e.preventDefault();
    runs = await getAddonRuns(activeEvent.id, null, null);
  }

  async function hideRuns(e) {
    e.preventDefault;
    runs = [];
  }

  async function showEvents(e) {
    e.preventDefault();
    showExistingEvents = true;
  }

  async function hideEvents(e) {
    if (e) e.preventDefault();
    showExistingEvents = false;
    runs = [];
    activeEvent = null;
    eventSelect = "0";
    schema = structuredClone(layout.addonDispatchOpen.parameters);

    const form = container && container.querySelector("form");
    if (form) {
      form.reset();
    }

    layout.params.addOnEvent = null;
    setHash(`#add-ons/${layout.addonDispatchOpen.repository}`);
  }

  function loadEvent(event) {
    if (!event) return;
    // set the active event
    activeEvent = event;
    showExistingEvents = true;

    // update the defaults to set the values in the form
    for (const param in event.parameters) {
      schema.properties[param].default = event.parameters[param];
    }
    const form = container && container.querySelector("form");
    if (form) form.reset();
    // set the event select widget
    eventSelect = event.event;
    // reset runs
    runs = [];
  }

  // generate a hash URL for each addon event
  function eventUrl(event) {
    const id = event.addonEvent.addon;
    const addon = layout.addonDispatchOpen;

    return `#add-ons/${addon.repository}/${id}`;
  }

  const ajv = new Ajv({
    schemaId: "auto",
    jsonPointers: true,
    allErrors: true,
    coerceTypes: true,
  });

  const validator = createAjvValidator(ajv);

  let value;
  let addonForm;

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
  let query =
    search && search.params && search.params.params && search.params.params.q;

  $: includeQuery = showQuery && (!showDocuments || docType === "query");
  $: includeDocuments =
    showDocuments && (!showQuery || docType === "documents");
  $: eventActive = eventSelect != 0 || activeEvent;

  // deal with hash routing
  $: if ($layout.params.addOnEvent) {
    eventSelect = $layout.params.addOnEvent;
    activeEvent = events.find((e) => e.id === $layout.params.addOnEvent);
    loadEvent(activeEvent);
  } else {
    hideEvents();
  }
</script>

<style>
  #repository-detail {
    font-size: 16px;
    font-weight: normal;
  }

  a {
    text-decoration: underline;
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
    color: var(--primary, #4294f0);
  }

  .eventSelect label {
    font-size: 16px;
    padding-right: 5px;
  }

  .runs {
    background: #eff7ff;
    border-radius: var(--radius, 3px);
    padding: 0;
    margin: 20px 0;
  }

  .events a {
    text-decoration: underline;
    color: #5a76a0;
  }

  .events a:hover {
    filter: brightness(85%);
  }
</style>

<div class="mcontent" bind:this={container}>
  {#if schema}
    <h2>
      {$_("addonsMenu.addon")}: {layout.addonDispatchOpen.name}
      <span id="repository-detail">
        by {layout.addonDispatchOpen.repository.split("/")[0]}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/{layout.addonDispatchOpen.repository}"
        >
          (View Source)
        </a>
      </span>
    </h2>

    {#if activeEvent}
      <h3>
        {$_("dialog.edit")}
        {eventNameField
          ? activeEvent.parameters[eventNameField]
          : `Event #${activeEvent.id}`}
      </h3>
    {/if}

    {#if showEventInfo && showExistingEvents}
      <Button nondescript={true} on:click={hideEvents}>
        {$_("addonDispatchDialog.hideAddons")}
      </Button>

      <div class="events">
        <ul>
          {#each events as event}
            <li>
              <a href={eventUrl(event)} on:click={() => loadEvent(event)}>
                {eventNameField
                  ? event.parameters[eventNameField]
                  : `Event #${event.id}`}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      {#if activeEvent && runs.length === 0}
        <Button nondescript={true} on:click={showRuns}>
          {$_("addonDispatchDialog.showRuns")}
        </Button>
      {:else if activeEvent && runs.length > 0}
        <Button nondescript={true} on:click={hideRuns}>
          {$_("addonDispatchDialog.hideRuns")}
        </Button>
      {/if}

      {#if runs.length > 0}
        <div class="runs">
          {#each runs as run (run.uuid)}
            <AddonRun {run} compact={true} />
          {/each}
        </div>
      {/if}
    {:else if events.length > 0}
      <Button nondescript={true} on:click={showEvents}>
        {$_("addonDispatchDialog.showAddons", {
          values: { n: events.length },
        })}
      </Button>
    {/if}

    <div class="markdown">
      <SvelteMarkdown source={schema.description} renderers={{ html: null }} />
    </div>

    <Form
      {schema}
      {components}
      {validator}
      {value}
      bind:this={addonForm}
      on:submit={(e) => {
        if (activeEvent) {
          updateAddonEvent(activeEvent.id, e.detail, eventSelect);
        } else if (eventSelect == 0) {
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
      {#if !eventActive}
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
      {/if}

      {#if showEventInfo}
        <div class="eventSelect">
          <label class="label"
            >{$_("addonDispatchDialog.runSchedule")}
            <span class="inputpadded">
              <select bind:value={eventSelect}>
                <option value="0">
                  {#if activeEvent}{$_(
                      "addonDispatchDialog.disable",
                    )}{:else}---{/if}
                </option>
                {#each eventSelectOptions as [value, label]}
                  <option {value}>{label}</option>
                {/each}
              </select>
            </span>
          </label>
        </div>
      {/if}

      <div class="buttonpadded">
        <!-- disable button when invalid, maybe -->
        {#if $orgsAndUsers.me}
          <Button type="submit">
            {eventActive ? $_("dialog.save") : $_("dialog.dispatch")}
          </Button>
          <Button secondary={true} on:click={emit.dismiss}>
            {$_("dialog.cancel")}
          </Button>
        {:else}
          <p><a href={SIGN_IN_URL}>{$_("addonDispatchDialog.signIn")}</a></p>
        {/if}
      </div>
    </Form>
  {/if}
</div>
