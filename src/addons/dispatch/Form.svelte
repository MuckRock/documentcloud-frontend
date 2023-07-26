<script context="module" lang="ts">
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

  export let properties: any = {};
  export let required = [];
  export let eventOptions: eventOptions;

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
</style>

<form method="post" bind:this={form} on:input on:change on:submit on:reset>
  <slot name="before" />

  {#each Object.entries(properties) as [name, p]}
    {@const params = objectify(p)}
    <fieldset>
      <svelte:component
        this={autofield(params)}
        {...params}
        {name}
        required={required.includes(name)}
        bind:value={$values[name]}
      />
    </fieldset>
  {/each}

  {#if hasEvents}
    <fieldset class="events">
      <label>
        {$_("addonDispatchDialog.runSchedule")}
        <select name="event" bind:value={$values["event"]}>
          <option value="disabled">---</option>
          {#each eventOptions.events as event}
            <option value={event}>{event}</option>
          {/each}
        </select>
      </label>
    </fieldset>
  {/if}

  <slot name="after" />

  <slot name="controls">
    <input type="submit" />
    <input type="reset" />
  </slot>
</form>
