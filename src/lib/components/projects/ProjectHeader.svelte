<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Globe16, Lock16 } from "svelte-octicons";
  import type { Project } from "$lib/api/types";
  import Flex from "$lib/components/common/Flex.svelte";
  import { remToPx } from "$lib/utils/layout";
  import ProjectPin from "./ProjectPin.svelte";

  export let project: Project;

  let width: number;
</script>

<div
  class="container"
  bind:clientWidth={width}
  class:sm={width < remToPx(32)}
  class:twoColumn={width > remToPx(48)}
>
  <Flex align="baseline" wrap justify="between">
    <ProjectPin {project} />
    <h1>{project.title}</h1>
    <div class="access">
      {#if project.private}
        <Flex align="center"><Lock16 /> {$_("projects.access.private")}</Flex>
      {:else}
        <Flex align="center"><Globe16 /> {$_("projects.access.public")}</Flex>
      {/if}
    </div>
  </Flex>
  <p class="description">{project.description}</p>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .sm.container h1 {
    order: 1;
    flex: 1 1 100%;
  }
  h1 {
    flex: 1 0 0;
    color: var(--gray-5);
    font-size: var(--font-xl);
    font-weight: var(--font-semibold);
  }
  .access {
    font-weight: var(--font-semibold);
  }
  .description {
    line-height: 1.4;
  }
  .twoColumn .description {
    columns: 2;
    column-gap: 1rem;
  }
</style>
