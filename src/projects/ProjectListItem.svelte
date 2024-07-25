<script lang="ts">
  import type { Project } from "../api/types/project";

  import { _ } from "svelte-i18n";
  import { Globe16, Lock16 } from "svelte-octicons";

  import ProjectPin from "./ProjectPin.svelte";
  import EditButton from "../common/EditButton.svelte";
  import Link from "../router/Link.svelte";

  import { Project as ProjectStructure } from "../structure/project";
  import { projectUrl } from "../search/search.js";

  export let project: Project;
  export let editProject;
</script>

<div class="project-link">
  <Link toUrl={projectUrl(project)}>
    <div class="container" id={`#project-${project.id}`}>
      <div class="row margin">
        <div class="center-self">
          <ProjectPin {project} />
        </div>
        <div class="stretch row gap-lg">
          <h3 class="project-title">{project.title}</h3>
        </div>
        {#if project.edit_access}
          <div class="center-self">
            <EditButton
              title={`Edit ${project.title}`}
              on:click={() => editProject(new ProjectStructure(project))}
            />
          </div>
        {/if}
        {#if project.private}
          <span class="small center center-self" title="Private Project">
            <Lock16 />
          </span>
        {:else}
          <span class="small center center-self" title="Public Project">
            <Globe16 />
          </span>
        {/if}
      </div>
      {#if project.description}
        <div class="description">{@html project.description}</div>
      {/if}
    </div>
  </Link>
</div>

<style>
  :global(.project-link a:hover) .container {
    background-color: var(--menuBg);
  }
  .container {
    display: block;
    min-width: 12rem;
    padding: 0.5rem;
    text-align: left;
  }

  .row {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
  }

  .margin {
    margin: 0.5rem;
  }

  .description {
    margin: 0 0.5em;
    opacity: 0.6;
    font-size: 0.875em;
    line-height: 1.4;
    color: var(--darkgray);
    overflow: hidden;
    -webkit-line-clamp: 4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    & > * {
      margin-top: 0;
    }
  }

  .project-title {
    margin: 0;
    font-weight: 600;
  }

  .small {
    height: 0.75rem;
    width: 0.75rem;
  }

  .center-self {
    align-self: center;
  }

  .center {
    display: inline-flex;
    align-items: center;
  }

  .stretch {
    flex: 1 1 auto;
  }
</style>
