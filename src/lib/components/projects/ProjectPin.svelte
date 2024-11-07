<script lang="ts" context="module">
  import { writable, type Writable } from "svelte/store";

  import { invalidate } from "$app/navigation";

  import { canonicalUrl } from "$lib/api/projects";
  import type { Project } from "$lib/api/types";
  import { getCsrfToken } from "$lib/utils/api";

  export const pinned: Writable<Project[]> = writable([]);

  export function sortPins(projects: Project[]): Project[] {
    if (projects === null) return [];
    try {
      projects.sort((a, b) => a.title.localeCompare(b.title));
    } catch (e) {}
    return projects;
  }
</script>

<script lang="ts">
  import Pin from "@/lib/components/common/Pin.svelte";
  import { pinProject } from "$lib/api/projects";

  export let project: Project;
  export let size = 1;

  async function toggle(e) {
    e.preventDefault();
    const csrf_token = getCsrfToken();
    if (!csrf_token) {
      console.error("No CSRF token found");
      return;
    }
    const newPinnedState = !project.pinned;

    const { data, error } = await pinProject(
      project.id,
      newPinnedState,
      csrf_token,
    );

    if (error || !data) {
      project.pinned = !project.pinned;
      console.error(error ?? "Missing data");
    } else {
      project = data;
      await invalidate(canonicalUrl(project));

      // now that we've updated, set $pinned
      $pinned = project.pinned
        ? sortPins([...$pinned, project])
        : $pinned.filter((a) => a.id !== project.id);
    }
  }
</script>

<Pin
  active={project.pinned}
  {size}
  disabled={!project.edit_access}
  on:click={toggle}
/>
