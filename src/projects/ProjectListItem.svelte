<script lang="ts">
  import { _ } from "svelte-i18n";

  import ProjectPin from "./ProjectPin.svelte";
  import type { Project } from "../api/types/project";
  import EditButton from "../common/EditButton.svelte";
  import { Lock16 } from "svelte-octicons";
  import { projectUrl } from "../search/search.js";

  export let project: Project;
  export let editProject: (project: Project) => void;

  const onEditClick = () => editProject(project);

  console.log("edit_access", project.edit_access);
</script>

<a class="project-link" href={projectUrl(project)}>
  <div class="container" id={`#project-${project.id}`}>
    <div class="row margin">
      <div class="center-self">
        <ProjectPin {project} />
      </div>
      <div class="stretch row">
        <h3 class="project-title">{project.title}</h3>
        {#if project.private}<span
            class="center center-self"
            title="Private Project"><Lock16 /></span
          >{/if}
      </div>
      {#if project.edit_access}
        <div class="center-self">
          <EditButton title={`Edit ${project.title}`} on:click={onEditClick} />
        </div>
      {/if}
    </div>
    {#if project.description}
      <div class="description">{@html project.description}</div>
    {/if}
  </div>
</a>

<style>
  .project-link:hover .container {
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
