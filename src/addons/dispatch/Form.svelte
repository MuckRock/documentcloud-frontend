<script context="module" lang="ts">
  export interface eventOptions {
    name: string;
    events: string[];
  }
</script>

<script lang="ts">
  import Ajv from "ajv";
  import addFormats from "ajv-formats";
  import { _ } from "svelte-i18n";

  import * as fields from "./fields/index.js";

  export let properties: any = {};
  export let required = [];
  export let eventOptions: eventOptions;

  export let values: any = {};

  const ajv = new Ajv();
  addFormats(ajv);

  let form: HTMLFormElement;
  let validate: Function;

  $: validate = ajv.compile({ type: "object", properties, required });

  function onSubmit(e) {
    values = new FormData(e.target);
  }

  function objectify(params) {
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
  on:change
  on:submit
  on:submit={onSubmit}
  on:reset
>
  <slot name="before" />

  {#each Object.entries(properties) as [name, p]}
    {@const params = objectify(p)}
    <fieldset>
      <svelte:component
        this={fields.get(params)}
        {...params}
        {name}
        required={required.includes(name)}
      />
    </fieldset>
  {/each}

  {#if eventOptions?.events?.length}
    <fieldset class="events">
      <label>
        {$_("addonDispatchDialog.runSchedule")}
        <select name="events">
          <option value="" />
          {#each eventOptions.events as event}
            <option value={event}>{event}</option>
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
