<script lang="ts" context="module">
  import { writable, type Writable } from "svelte/store";
  import type { Project } from "../api/types/project";

  export const pinned: Writable<Project[]> = writable([]);
</script>

<script lang="ts">
  import { getCsrfToken } from "../api/session.js";
  import { baseApiUrl } from "../api/base.js";
  import Pin from "../common/Pin.svelte";

  export let project: Project;
  export let size = 1;

  $: endpoint = new URL(`/api/projects/${project.id}/`, baseApiUrl);

  async function toggle(event) {
    event.preventDefault();

    const csrftoken = getCsrfToken();
    const options: RequestInit = {
      credentials: "include",
      method: "PATCH", // this component can only update whether a project is pinned
      headers: { "X-CSRFToken": csrftoken, "Content-type": "application/json" },
    };

    // optimistic update
    project.pinned = !project.pinned;

    const resp = await fetch(endpoint, {
      ...options,
      body: JSON.stringify({ pinned: project.pinned }),
    }).catch((err) => {
      project.pinned = !project.pinned;
      return {
        ok: false,
        statusText: String(err),
      };
    });

    if (!resp.ok) {
      // reset pinned state
      project.pinned = !project.pinned;
      console.error(`Problem updating add-on: ${resp.statusText}`);
    }

    // now that we've updated, set $pinned
    $pinned = project.pinned
      ? [...$pinned, project]
      : $pinned.filter((a) => a.id !== project.id);
  }
</script>

<Pin active={project.pinned} on:click={toggle} {size} />
