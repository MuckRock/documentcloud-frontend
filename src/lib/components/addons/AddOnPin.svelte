<script lang="ts" module>
  import type { AddOn } from "$lib/api/types";
  import { writable, type Writable } from "svelte/store";

  export const pinned: Writable<AddOn[]> = writable([]);
</script>

<script lang="ts">
  import Pin from "../common/Pin.svelte";
  import { getCsrfToken } from "$lib/utils/api";
  import { BASE_API_URL } from "@/config/config";

  interface Props {
    addon: AddOn;
    size?: number;
  }

  let { addon = $bindable(), size = 1 }: Props = $props();

  let endpoint = $derived(new URL(`/api/addons/${addon.id}/`, BASE_API_URL));

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
    addon = { ...addon, active: !addon.active };

    const resp = await fetch(endpoint, {
      ...options,
      body: JSON.stringify({ active: addon.active }),
    }).catch((err) => {
      addon = { ...addon, active: !addon.active };
      return {
        ok: false,
        statusText: String(err),
      };
    });

    if (!resp.ok) {
      // reset active state
      addon = { ...addon, active: !addon.active };
      console.warn(`Problem updating add-on: ${resp.statusText}`);
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
