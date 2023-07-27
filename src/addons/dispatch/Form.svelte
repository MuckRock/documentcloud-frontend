<script context="module" lang="ts">
  import type { Event } from "../runs/EventList.svelte";
  import { writable } from "svelte/store";

  export const values = writable({ event: "", selection: null });

  export interface eventOptions {
    name: string;
    events: string[];
  }
</script>

<script lang="ts">
  import Ajv from "ajv";
  import addFormats from "ajv-formats";
  import { _ } from "svelte-i18n";

  // todo: figure out how to use a real path
  import { autofield } from "./fields";
  import Button from "../../common/Button.svelte";

  export let properties: any = {};
  export let required = [];
  export let eventOptions: eventOptions;
  export let event: Event = null;

  const ajv = new Ajv();
  addFormats(ajv);

  let form: HTMLFormElement;

  $: validator = ajv.compile({ type: "object", properties, required });
  $: hasEvents = eventOptions && eventOptions.events.length > 0;

  function objectify(params: any) {
    if (typeof params === "string") {
      params = { type: params };
    }

    return params;
  }

  export function validate() {
    const valid = validator($values);

    return { valid, errors: validator.errors };
  }
</script>

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
    border-radius: var(--radius);
    border-color: rgba(0, 0, 0, .1);
    border-width: 1px;
  }

  .controls {
    display: flex;
    justify-content: space-between;
  }
</style>

<form method="post" bind:this={form} on:input on:change on:submit on:reset>
  <slot name="before" />

  <fieldset>
  {#each Object.entries(properties) as [name, p]}
    {@const params = objectify(p)}
    <svelte:component
      this={autofield(params)}
      {...params}
      {name}
      required={required.includes(name)}
      bind:value={$values[name]}
    />
  {/each}
  </fieldset>

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
            <option value={event}>{event}</option>
          {/each}
        </select>
      </label>
    </fieldset>
  {/if}

  <slot name="after" />

  <slot name="controls">
    <div class="controls">
      <Button type="submit" label="Submit" />
      <Button secondary type="reset" label="Reset" />
    </div>
  </slot>
</form>
