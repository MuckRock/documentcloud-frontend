<script context="module" lang="ts">
  import { writable } from "svelte/store";

  export const values = writable({ event: "disabled", selection: null });
</script>

<script lang="ts">
  import type {
    Maybe,
    Nullable,
    Event,
    EventOptions,
    Run,
  } from "$lib/api/types";

  import { enhance } from "$app/forms";
  import { page } from "$app/stores";
  import { afterNavigate } from "$app/navigation";

  import Ajv from "ajv";
  import addFormats from "ajv-formats";
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import { Pencil24, Sync24 } from "svelte-octicons";

  import ArrayField from "../inputs/ArrayField.svelte";
  import Button from "../common/Button.svelte";
  import Field from "../inputs/Field.svelte";
  import Tip from "../common/Tip.svelte";

  import { autofield } from "../inputs/generator";
  import { schedules } from "$lib/api/addons";
  import { getCurrentUser } from "$lib/utils/permissions";

  export let properties: any = {};
  export let required: string[] = [];
  export let eventOptions: Maybe<EventOptions>;
  export let event: Maybe<Nullable<Event>> = null;
  export let action: string = "";
  export let disablePremium = false;

  const ajv = new Ajv();
  addFormats(ajv);

  const dispatch = createEventDispatcher();
  const me = getCurrentUser();

  let form: HTMLFormElement;
  let created: Nullable<Event | Run> = null;
  let running = false;

  $: validator = ajv.compile({ type: "object", properties, required });
  $: hasEvents = eventOptions && eventOptions.events.length > 0;
  $: hasFields = Object.keys(properties).length > 0;

  afterNavigate(() => {
    // set initial values
    if (event) {
      $values = {
        ...event.parameters,
        event: schedules[event.event],
      };
    }
    // prefill values from search params
    new URLSearchParams($page.url.searchParams).forEach((v, k) => {
      if (k in properties) {
        $values[k] = v;
      }
    });
  });

  function objectify(params: any) {
    if (typeof params === "string") {
      params = { type: params };
    }

    return params;
  }

  function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  export function reset() {
    $values = { event: "disabled", selection: null };
  }

  export function validate() {
    $values = noNulls($values);
    const valid = validator($values);

    return { valid, errors: validator.errors };
  }

  function noNulls<T extends Record<string, unknown> | ArrayLike<unknown>>(
    values: T,
  ) {
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

  /** @type {import('@sveltejs/kit').SubmitFunction} */
  function onSubmit({ submitter }) {
    submitter.disabled = true;
    running = true;

    return ({ result, update }) => {
      running = false;
      const { type, data } = result;
      if (type === "success") {
        created = data.type === "event" ? data.event : data.run;
        dispatch("dispatch", data);
      }
      update(result);
      submitter.disabled = false;
    };
  }
</script>

<form
  method="post"
  {action}
  bind:this={form}
  on:submit
  on:reset
  use:enhance={onSubmit}
>
  <slot name="before" />
  {#if event}
    <div class="tip">
      <Tip mode="normal">
        <Pencil24 slot="icon" />
        {$_("addonDispatchDialog.editing")}
      </Tip>
    </div>
  {/if}
  {#if hasFields}
    <fieldset>
      {#each Object.entries(properties) as [name, p]}
        {@const params = objectify(p)}
        {#if params.type === "array"}
          <!-- let arrays be a special case -->
          <ArrayField
            bind:value={$values[name]}
            {name}
            items={params.items}
            title={params.title}
            description={params.description}
          />
        {:else}
          <Field
            inline={params.type === "boolean"}
            title={params.title}
            description={params.description}
            required={required?.includes(name)}
          >
            <svelte:component
              this={autofield(params)}
              {...params}
              {name}
              required={required?.includes(name)}
              bind:value={$values[name]}
              defaultValue={params.default}
              choices={params.enum}
            />
          </Field>
        {/if}
      {/each}
    </fieldset>
  {/if}

  {#if hasEvents}
    <fieldset class="events">
      <label>
        {$_("addonDispatchDialog.runSchedule")}
        <select name="event" bind:value={$values["event"]}>
          <option value="disabled">
            {event
              ? $_("addonDispatchDialog.disable")
              : $_("addonDispatchDialog.runOnce")}
          </option>
          {#each eventOptions?.events ?? [] as event}
            <option value={event}>{capitalize(event)}</option>
          {/each}
        </select>
      </label>
    </fieldset>
  {/if}

  <slot name="selection" />

  <slot name="premium" />

  <div class="controls">
    {#if event}
      <Button type="submit" mode="primary" disabled={!$me || disablePremium}>
        {#if running}
          <span class="in-progress icon" title="In Progress"><Sync24 /></span>
        {:else}
          {$_("dialog.save")}
        {/if}
      </Button>
    {:else}
      <Button type="submit" mode="primary" disabled={!$me || disablePremium}>
        {#if running}
          <span class="in-progress icon" title="In Progress"><Sync24 /></span>
        {:else}
          {$_("dialog.dispatch")}
        {/if}
      </Button>
    {/if}
    <Button type="button" ghost mode="primary" on:click={reset}>
      {$_("dialog.reset")}
    </Button>
  </div>
</form>

<style>
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  form {
    width: 100%;
    background: var(--white);
  }

  .tip {
    margin: 1rem;
  }

  fieldset {
    display: flex;
    flex-direction: column;
    gap: 1em;
    margin: 1rem;
    padding: 1em;
    background: var(--white);
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2);
  }

  .controls {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    position: sticky;
    bottom: 0;
    background-color: var(--white);
    padding: 1rem;
    border-top: 1px solid var(--gray-1);
  }

  .in-progress.icon {
    display: block;
    fill: var(--white, white);
    transform-origin: center center;
    animation: spin 2s linear infinite reverse;
    animation-play-state: running;
    & svg {
      display: block;
    }
  }
</style>
