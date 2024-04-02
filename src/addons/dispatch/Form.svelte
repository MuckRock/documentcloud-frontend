<script context="module" lang="ts">
  import { writable } from "svelte/store";

  export const values = writable({ event: "disabled", selection: null });
</script>

<script lang="ts">
  import Ajv from "ajv";
  import addFormats from "ajv-formats";
  import { _ } from "svelte-i18n";

  import { autofield } from "./fields/index.js";
  import type { Event, EventOptions } from "../types";
  import Button from "../../common/Button.svelte";

  export let properties: any = {};
  export let required = [];
  export let eventOptions: EventOptions;
  export let event: Event = null;

  const ajv = new Ajv();
  addFormats(ajv);

  let form: HTMLFormElement;

  $: validator = ajv.compile({ type: "object", properties, required });
  $: hasEvents = eventOptions && eventOptions.events.length > 0;
  $: hasFields = Object.keys(properties).length > 0;

  function objectify(params: any) {
    if (typeof params === "string") {
      params = { type: params };
    }

    return params;
  }

  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  export function validate() {
    $values = noNulls($values);
    const valid = validator($values);

    return { valid, errors: validator.errors };
  }

  function noNulls(values) {
    return Object.entries(values).reduce(
      (m, [k, v]) => {
        if (v !== null) {
          m[k] = v;
        }
        return m;
      },
      { event: "disabled", selection: null },
    );
  }
</script>

<form method="post" bind:this={form} on:input on:change on:submit on:reset>
  <slot name="before" />

  {#if hasFields}
    <fieldset>
      {#each Object.entries(properties) as [name, p]}
        {@const params = objectify(p)}
        <svelte:component
          this={autofield(params)}
          {...params}
          {name}
          required={required.includes(name)}
          bind:value={$values[name]}
          defaultValue={params.default}
          choices={params.enum}
        />
      {/each}
    </fieldset>
  {/if}

  {#if hasEvents}
    <fieldset class="events">
      <label>
        {$_("addonDispatchDialog.runSchedule")}
        <select name="event" bind:value={$values["event"]}>
          <option value="disabled"
            >{event
              ? $_("addonDispatchDialog.disable")
              : $_("addonDispatchDialog.runOnce")}</option
          >
          {#each eventOptions.events as event}
            <option value={event}>{capitalize(event)}</option>
          {/each}
        </select>
      </label>
    </fieldset>
  {/if}

  <slot name="selection" />

  <slot name="premium" />

  <slot name="controls">
    <div class="controls">
      <Button type="submit" label="Submit" />
      <Button secondary type="reset" label="Reset" />
    </div>
  </slot>
</form>

<style>
  form {
    width: 100%;
  }

  fieldset {
    display: flex;
    flex-direction: column;
    gap: 1em;
    margin: 0 0 1em 0;
    padding: 1em;
    background: var(--light-gray);
    border-radius: var(--radius);
    border-color: rgba(0, 0, 0, 0.1);
    border-width: 1px;
  }

  .controls {
    display: flex;
    justify-content: space-between;
  }
</style>
