<svelte:options accessors={true} />

<script lang="ts">
  import { onMount, tick } from "svelte";
  import { _ } from "svelte-i18n";

  import type { AddOnListItem } from "../browser/AddOnListItem.svelte";
  import type { Event } from "../runs/EventList.svelte";

  import Drawer from "../Drawer.svelte";
  import Header from "./Header.svelte";
  import Form, { values } from "./Form.svelte";
  import Selection from "./Selection.svelte";
  import { schedules } from "../runs/EventList.svelte";

  import { baseApiUrl } from "../../api/base.js";
  import { getCsrfToken } from "../../api/session.js";
  import { setHash } from "../../router/router.js";

  export let visible: boolean = false;
  export let addon: AddOnListItem;
  export let event: Event;

  const eventValues = {
    disabled: 0,
    hourly: 1,
    daily: 2,
    weekly: 3,
  };

  let error: Error | null;
  let drawer: Drawer;
  let form: Form;
  let selection: Selection;

  $: loading = !addon;

  onMount(() => {
    if (event) {
      $values = {
        ...event.parameters,
        event: schedules[event.event],
      };
    }
  });

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
    console.log(`Loading event: ${id}`);
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

    // event is scheduling, so schedule
    // this creates or updates an event
    if ($values.event) {
      promises.push(schedule());
    }

    // dispatch when we first create an event
    // or if there's no scheduling
    if (!event) {
      promises.push(send());
    }

    await Promise.all(promises);

    setHash("add-ons/runs");
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

    const endpoint = new URL("/api/addon_runs/", baseApiUrl);

    const resp = await fetch(endpoint, options);

    if (!resp.ok) {
      error = new Error(resp.statusText);
      return;
    }

    console.log(await resp.json());
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

    console.log(await resp.json());
  }

  function reset() {
    console.log("Clearing form data ...");
    $values = { event: "", selection: null };
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

  input[type="button"],
  input[type="submit"] {
    cursor: pointer;
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
      <Form
        bind:this={form}
        on:submit={onSubmit}
        properties={addon.parameters.properties}
        required={addon.parameters.required}
        eventOptions={addon.parameters.eventOptions}
      >
        <Selection
          bind:this={selection}
          bind:value={$values["selection"]}
          slot="after"
          documents={new Set(addon.parameters.documents)}
        />

        <div slot="controls" class="controls">
          {#if event}
            <input type="submit" value={$_("dialog.save")} />
          {:else}
            <input type="submit" value={$_("dialog.dispatch")} />
          {/if}
          <input type="button" on:click={close} value={$_("dialog.cancel")} />
        </div>
      </Form>
    {/if}
  </div>
</Drawer>
