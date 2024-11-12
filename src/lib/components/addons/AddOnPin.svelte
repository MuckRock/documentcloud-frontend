<script lang="ts" context="module">
  import { writable, type Writable } from "svelte/store";
  import type { AddOnListItem } from "$lib/api/types";

  export const pinned: Writable<AddOnListItem[]> = writable([]);
</script>

<script lang="ts">
  import { getCsrfToken } from "$lib/utils/api";
  import { BASE_API_URL } from "@/config/config";
  import Pin from "../common/Pin.svelte";

  export let addon: AddOnListItem;
  export let size = 1;

  $: endpoint = new URL(`/api/addons/${addon.id}/`, BASE_API_URL);

  async function toggle(event) {
    event.preventDefault();

    const csrftoken = getCsrfToken();
    if (!csrftoken) {
      console.error("No CSRF token found");
      return;
    }
    const options: RequestInit = {
      credentials: "include",
      method: "PATCH", // this component can only update whether an addon is active or not
      headers: { "X-CSRFToken": csrftoken, "Content-type": "application/json" },
    };

    // optimistic update
    addon.active = !addon.active;

    const resp = await fetch(endpoint, {
      ...options,
      body: JSON.stringify({ active: addon.active }),
    }).catch((err) => {
      addon.active = !addon.active;
      return {
        ok: false,
        statusText: String(err),
      };
    });

    if (!resp.ok) {
      // reset active state
      addon.active = !addon.active;
      console.error(`Problem updating add-on: ${resp.statusText}`);
    }

    // now that we've updated, set $pinned
    $pinned = addon.active
      ? [...$pinned, addon]
      : $pinned.filter((a) => a.id !== addon.id);
  }
</script>

<Pin
  active={addon.active}
  on:click={toggle}
  {size}
  --fill={addon.active ? "var(--orange)" : "var(--gray-3)"}
/>
