<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Globe16, Lock16 } from "svelte-octicons";
  import type { Project } from "$lib/api/types";
  import Flex from "$lib/components/common/Flex.svelte";
  import { remToPx } from "$lib/utils/layout";
  import ProjectPin from "./ProjectPin.svelte";
  import Access, { getLevel } from "../common/Access.svelte";

  export let project: Project;
  export let show = {
    pin: true,
    access: true,
  };

  let width: number;
</script>

<div
  class="container"
  bind:clientWidth={width}
  class:sm={width < remToPx(32)}
  class:twoColumn={width > remToPx(48)}
>
  <Flex align="baseline" wrap justify="between">
    {#if show.pin}
      <ProjectPin {project} />
    {/if}
    <h1>{project.title}</h1>
    {#if show.access}
      <div class="access">
        {#if project.private}
          <Access level={getLevel("private")} />
        {:else}
          <Access level={getLevel("public")} />
        {/if}
      </div>
    {/if}
  </Flex>
  {#if project.description}
    <p class="description">{project.description}</p>
  {/if}
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
    margin: 0;
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
