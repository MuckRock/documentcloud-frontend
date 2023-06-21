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

  export let debug = false;

  export let properties: any = {};
  export let required = [];
  export let eventOptions: eventOptions;

  export let values: any = {};

  export function onSubmit(e) {
    values = new FormData(e.target);
  }

  const ajv = new Ajv();
  addFormats(ajv);

  let form: HTMLFormElement;
  let validate: Function;

  $: validate = ajv.compile({ type: "object", properties, required });

  $: console.log(eventOptions);
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
  {#if debug}
    <pre>
    <code>
{JSON.stringify(
          { type: "object", properties, required, eventOptions },
          null,
          2,
        )}
    </code>
  </pre>
  {/if}

  {#if eventOptions?.events?.length}
    <div class="events">
      <label>
        {$_("addonDispatchDialog.runSchedule")}
        <select name="events">
          <option value="" />
          {#each eventOptions.events as event}
            <option value={event}>{event}</option>
          {/each}
        </select>
      </label>
    </div>
  {/if}

  <div class="controls">
    <input type="submit" />
    <input type="reset" />
  </div>
</form>
