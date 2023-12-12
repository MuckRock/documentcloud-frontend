<script>
  import Link from "@/router/Link.svelte";
  import { editProject } from "@/manager/layout.js";
  import { projectUrl } from "@/search/search.js";

  // SVG assets
  import pencilSvg from "@/assets/pencil.svg?raw";

  export let project;
</script>

<Link toUrl={projectUrl(project)}>
  <div class="project">
    <span class="title">{project.title}</span>
    {#if project.editAccess}
      <button
        class="edit"
        on:click|stopPropagation|preventDefault={() => editProject(project)}
      >
        {@html pencilSvg}
      </button>
    {/if}
  </div>
</Link>

<style>
  .project {
    padding: 11px 25px 11px 0;
    display: table;
    width: 100%;
    box-sizing: border-box;
  }

  .project:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  .project > * {
    display: table-cell;
    vertical-align: top;
  }

  .project .edit {
    background: none;
    border: none;
    cursor: pointer;
    float: right;

    padding-right: 5px;
    padding-top: 3px;
    width: 15px;
  }

  .project .edit:hover {
    filter: brightness(0.3);
  }

  .title {
    font-size: var(--normal);
    user-select: none;
    word-break: break-word;
  }
</style>
