<svelte:options accessors={true} />

<script lang="ts">
  import { onMount, tick } from "svelte";

  import type { AddOnListItem } from "../browser/AddOnListItem.svelte";
  import type { Event } from "../runs/EventList.svelte";

  import Drawer from "../Drawer.svelte";
  import Header from "./Header.svelte";
  import Form, { values } from "./Form.svelte";
  import Selection from "./Selection.svelte";
  import { schedules } from "../runs/EventList.svelte";

  import { baseApiUrl } from "../../api/base.js";
  import { getCsrfToken } from "../../api/session.js";

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
  export let form: Form;
  export let selection: Selection;

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
      error = null;
    } else {
      addon = null;
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

    if (valid) {
      await send();
    }
  }

  async function send() {
    const { event, selection, ...parameters } = $values;
    const payload = {
      parameters,
      ...selection,
      addon: addon.id,
    };

    if (event) {
      payload.event = eventValues[event];
    }

    console.log(payload);

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

    const data = resp.json();

    console.log(data);

    // drawer.close();
  }

  function reset() {
    $values = { event: "", selection: null };
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
  <div slot="content">
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
      </Form>
    {/if}
  </div>
</Drawer>
