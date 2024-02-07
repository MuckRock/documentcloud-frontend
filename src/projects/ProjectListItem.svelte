<script lang="ts">
  import { _ } from "svelte-i18n";

  import ProjectPin from "./ProjectPin.svelte";
  import type { Project } from "../api/types/project";
  import EditButton from "../common/EditButton.svelte";

  export let project: Project;
  export let editProject: (project: Project) => void;

  const onEditClick = () => editProject(project);

  console.log("edit_access", project.edit_access);
</script>

<a class="project-link" href={`/projects/${project.slug}`}>
  <div class="container" id={`#project-${project.id}`}>
    <div class="row">
      <div class="center-self">
        <ProjectPin {project} />
      </div>
      <div class="stretch">
        <h3 class="project-title">{project.title}</h3>
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
    margin: 0.5rem;
  }

  .badge {
    margin-bottom: -0.25em;
    font-size: 0.8em;
  }

  .metadata {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
    color: var(--darkgray);
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

  .stretch {
    flex: 1 1 auto;
  }

  .author a:hover {
    opacity: 0.7;
  }

  p {
    margin: 0;
  }
</style>
