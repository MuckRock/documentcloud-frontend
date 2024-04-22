<script lang="ts" context="module">
  import { writable, type Writable } from "svelte/store";
  import type { Project } from "@/lib/api/types";

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
  import { pinProject } from "@/lib/api/projects";
  import { page } from "$app/stores";

  export let project: Project;
  export let size = 1;

  $: csrf_token = $page.data.csrf_token;

  async function toggle(event) {
    event.preventDefault();

    const newPinnedState = !project.pinned;
    try {
      // optimistic update
      project.pinned = newPinnedState;
      project = await pinProject(csrf_token, project.id, newPinnedState);
    } catch {
      // undo optimistic update on error
      project.pinned = !project.pinned;
    }

    // now that we've updated, set $pinned
    $pinned = project.pinned
      ? sortPins([...$pinned, project])
      : $pinned.filter((a) => a.id !== project.id);
  }
</script>

<Pin active={project.pinned} on:click={toggle} {size} />
