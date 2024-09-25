<script lang="ts" context="module">
  import type { Project } from "@/lib/api/types";

  import { invalidate } from "$app/navigation";

  import { writable, type Writable } from "svelte/store";
  import { getCsrfToken } from "$lib/utils/api";

  import { canonicalUrl } from "$lib/api/projects";

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
  import Pin from "@/common/Pin.svelte";
  import { pinProject } from "$lib/api/projects";

  export let project: Project;
  export let size = 1;

  async function toggle(e) {
    e.preventDefault();
    const csrf_token = getCsrfToken();
    const newPinnedState = !project.pinned;
    let error: unknown;

    ({ data: project, error } = await pinProject(
      project.id,
      newPinnedState,
      csrf_token,
    ));

    if (error) {
      project.pinned = !project.pinned;
      console.error(error);
    } else {
      await invalidate(canonicalUrl(project));
    }

    // now that we've updated, set $pinned
    $pinned = project.pinned
      ? sortPins([...$pinned, project])
      : $pinned.filter((a) => a.id !== project.id);
  }
</script>

<Pin active={project.pinned} on:click={toggle} {size} />
