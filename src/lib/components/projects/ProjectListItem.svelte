<script lang="ts">
  import type { Project } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Globe16, Lock16 } from "svelte-octicons";

  import ProjectPin from "./ProjectPin.svelte";

  import { canonicalUrl } from "$lib/api/projects";
  import { renderMarkdown } from "$lib/utils/markup";
  import { ALLOWED_TAGS } from "@/config/config.js";

  // Strip anchor tags to avoid invalid nested <a> inside the card link
  const listItemTags = ALLOWED_TAGS.filter((tag: string) => tag !== "a");

  interface Props {
    project: Project;
  }

  let { project }: Props = $props();

  let href = $derived(canonicalUrl(project).href);
</script>

<a {href} id={project.id.toString()}>
  <div class="container">
    <div class="row margin">
      <div class="center-self">
        <ProjectPin {project} />
      </div>
      <div class="stretch row gap-lg">
        <h3 class="project-title">{project.title}</h3>
      </div>
      {#if project.private}
        <span class="small center center-self" title={$_("projects.private")}>
          <Lock16 />
        </span>
      {:else}
        <span class="small center center-self" title={$_("projects.public")}>
          <Globe16 />
        </span>
      {/if}
    </div>
    {#if project.description}
      <div class="description">{@html renderMarkdown(project.description, { allowedTags: listItemTags })}</div>
    {/if}
  </div>
</a>

<style>
  a {
    color: inherit;
    text-decoration: none;
  }

  a:hover .container,
  a:target .container {
    background-color: var(--blue-1);
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
    line-clamp: 4;
    -webkit-line-clamp: 4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    & > :global(*) {
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
