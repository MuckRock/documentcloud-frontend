<svelte:options accessors={true} />

<script lang="ts">
  import { onMount, tick } from "svelte";
  import { _ } from "svelte-i18n";

  import type { AddOnListItem } from "../browser/AddOnListItem.svelte";
  import type { Event } from "../runs/ScheduledEvent.svelte";

  import Button from "../../common/Button.svelte";
  import Drawer from "../Drawer.svelte";
  import Form, { values } from "./Form.svelte";
  import Header from "./Header.svelte";
  import Selection from "./Selection.svelte";
  import ScheduledInset from "./ScheduledInset.svelte";
  import { schedules } from "../runs/ScheduledEvent.svelte";

  import { baseApiUrl } from "../../api/base.js";
  import { getCsrfToken } from "../../api/session.js";
  import { pushToast } from "../../common/Toast.svelte";
  import { runs } from "../progress/AddonRun.svelte";

  export let visible: boolean = false;
  export let addon: AddOnListItem;
  export let event: Event;

  const eventValues = {
    disabled: 0,
    hourly: 1,
    daily: 2,
    weekly: 3,
    upload: 4,
  };

  let error: Error | null;

  let drawer: Drawer;
  let form: Form;
  let scheduled: ScheduledInset;
  let selection: Selection;

  $: loading = !addon;
  $: if (error) {
    pushToast(error.message, "error");
  }

  $: if (!visible) {
    reset();
  }

  onMount(() => {
    if (event) {
      $values = {
        ...event.parameters,
        event: schedules[event.event],
      };
    }
  });

  // extract initial form values from querystring
  function valuesFromQS(initial: any) {
    let qs = new URLSearchParams(window.location.search);

    // only accept values in properties
    const { properties } = addon.parameters;
    const values = Object.fromEntries(
      Array.from(qs).filter(([k, v]) => properties.hasOwnProperty(k)),
    );

    if (qs.has("event")) {
      values["event"] = qs.get("event");
    }

    return { ...initial, ...values };
  }

  async function load_addon(repo: string) {
    const options: RequestInit = {
      credentials: "include",
    };

    const endpoint = new URL(`/api/addons/?repository=${repo}`, baseApiUrl);

    const resp = await fetch(endpoint, options)
      .then((r) => r.json())
      .catch((err) => {
        error = err;
        addon = null;

        return { results: [], error: err };
      });

    if (resp.results.length > 0) {
      // should only ever be one result
      addon = resp.results[0];
      event = null;
      error = null;
    } else {
      addon = null;
      event = null;
      error = new Error("Not found");
    }
  }

  async function load_event(id: number) {
    const options: RequestInit = {
      credentials: "include",
    };

    const endpoint = new URL(
      `/api/addon_events/${id}/?expand=addon`,
      baseApiUrl,
    );

    // give temp names so we can re-assign
    const { addon: a, ...e } = await fetch(endpoint, options).then((r) =>
      r.json(),
    );

    addon = a;
    event = e;

    $values = {
      ...event.parameters,
      event: schedules[event.event],
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    const { valid, errors } = form.validate();

    if (!valid) {
      console.error(errors);
      return;
    }

    let promises = [];

    // if we're editing an event, any save should update the schedule
    if (event || $values["event"] !== "disabled") {
      promises.push(schedule());
    }

    // dispatch when we first create an event
    // or if there's no scheduling
    if (!event) {
      promises.push(send());
    }

    await Promise.all(promises);

    close();
  }

  /*
   * Dispatch a single add-on run
   */
  async function send() {
    const { selection, ...parameters } = $values;
    const payload = {
      parameters,
      ...selection,
      addon: addon.id,
    };

    const csrftoken = getCsrfToken();
    const options: RequestInit = {
      credentials: "include",
      method: "POST",
      headers: { "X-CSRFToken": csrftoken, "Content-type": "application/json" },
      body: JSON.stringify(payload),
    };

    const endpoint = new URL("/api/addon_runs/?expand=addon", baseApiUrl);

    const resp = await fetch(endpoint, options);

    if (!resp.ok) {
      error = new Error(resp.statusText);
      return;
    }

    const run = await resp.json();
    $runs = [run, ...$runs];

    pushToast($_("addonDispatchDialog.runSuccess"), "success");
  }

  /*
   * Create an add-on event to schedule future runs
   */
  async function schedule() {
    if (!$values.event) {
      throw new Error(`Missing event data: ${JSON.stringify($values)}`);
    }

    const { event: evt, selection, ...parameters } = $values;

    const payload = {
      parameters,
      ...selection,
      addon: addon.id,
      event: eventValues[evt],
    };

    const path = event
      ? `/api/addon_events/${event.id}/`
      : "/api/addon_events/";

    const endpoint = new URL(path, baseApiUrl);

    const csrftoken = getCsrfToken();
    const options: RequestInit = {
      credentials: "include",
      method: event ? "PUT" : "POST", // update or create?
      headers: { "X-CSRFToken": csrftoken, "Content-type": "application/json" },
      body: JSON.stringify(payload),
    };

    const resp = await fetch(endpoint, options);

    if (!resp.ok) {
      error = new Error(resp.statusText);
      return;
    }

    pushToast($_("addonDispatchDialog.scheduleSuccess"), "success");
  }

  function reset() {
    $values = { event: "disabled", selection: null };
  }

  function close() {
    drawer.close();
    reset();
  }

  export async function open(repo: string, id: number | null) {
    addon = null;
    await tick();
    if (id) {
      await load_event(id);
    } else {
      await load_addon(repo);
    }

    $values = valuesFromQS($values);

    visible = true;
  }
</script>

<style>
  [slot="content"] {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    padding: 1em;
    max-width: 60ch;
    transition: opacity 0.25s ease;
  }

  [slot="content"].loading {
    opacity: 0;
  }

  .controls {
    display: flex;
    justify-content: space-between;
  }
</style>

<Drawer
  anchor="right"
  bind:this={drawer}
  bind:visible
  on:open
  on:close
  on:close={reset}
>
  <div slot="content" class:loading>
    {#if addon}
      <Header {addon} />

      <ScheduledInset bind:this={scheduled} {addon} />

      <Form
        bind:this={form}
        on:submit={onSubmit}
        properties={addon.parameters.properties}
        required={addon.parameters.required}
        eventOptions={addon.parameters.eventOptions}
        {event}
      >
        <!-- todo: decide if this should render for scheduled add-ons -->
        <!-- this only applies to add-ons running against existing documents -->
        <Selection
          bind:this={selection}
          bind:value={$values["selection"]}
          slot="after"
          documents={new Set(addon.parameters.documents)}
        />

        <div slot="controls" class="controls">
          <div class="primary">
            {#if event}
              <Button type="submit" label={$_("dialog.save")} />
            {:else}
              <Button type="submit" label={$_("dialog.dispatch")} />
            {/if}
          </div>
          <div class="secondary">
            <Button
              secondary
              type="button"
              on:click={reset}
              label={$_("dialog.reset")}
            />
            <Button
              secondary
              type="button"
              on:click={close}
              label={$_("dialog.cancel")}
            />
          </div>
        </div>
      </Form>
    {/if}
  </div>
</Drawer>
