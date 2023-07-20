<script context="module" lang="ts">
  export interface eventOptions {
    name: string;
    events: string[];
  }
</script>

<script lang="ts">
  import Ajv from "ajv";
  import addFormats from "ajv-formats";
  import { set } from "lodash";
  import { _ } from "svelte-i18n";

  import { autofield } from "./fields";

  export let properties: any = {};
  export let required = [];
  export let eventOptions: eventOptions;

  export let values: any = {};

  const ajv = new Ajv();
  addFormats(ajv);

  let form: HTMLFormElement;
  let validate: Function;

  $: validate = ajv.compile({ type: "object", properties, required });
  $: hasEvents = eventOptions && eventOptions.events.length > 0;

  function onSubmit(e) {
    e.preventDefault();
    values = new FormData(e.target);
  }

  function onChange(e) {
    const f = new FormData(form);
    let update: any = {};

    for (const [k, v] of f) {
      // basic update
      set(update, k, v);

      // special cases
      if (k === "event") {
        update[k] = +v;
      }
    }

    values = update;
  }

  function objectify(params: any) {
    if (typeof params === "string") {
      params = { type: params };
    }

    return params;
  }
</script>

<style>
</style>

<form
  method="post"
  bind:this={form}
  on:input={onChange}
  on:change={onChange}
  on:submit
  on:submit={onSubmit}
  on:reset
>
  <slot name="before" />

  {#each Object.entries(properties) as [name, p]}
    {@const params = objectify(p)}
    <fieldset>
      <svelte:component
        this={autofield(params)}
        {...params}
        {name}
        required={required.includes(name)}
      />
    </fieldset>
  {/each}

  {#if hasEvents}
    <fieldset class="events">
      <label>
        {$_("addonDispatchDialog.runSchedule")}
        <select name="event">
          <option value="">---</option>
          {#each eventOptions.events as event, i}
            <option value={i}>{event}</option>
          {/each}
        </select>
      </label>
    </fieldset>
  {/if}

  <slot name="after" />

  <div class="controls">
    <input type="submit" />
    <input type="reset" />
  </div>
</form>
