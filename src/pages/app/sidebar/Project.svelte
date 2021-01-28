<script>
  import Link from "@/router/Link";
  import { editProject } from "@/manager/layout";
  import { projectUrl } from "@/search/search";

  // SVG assets
  import pencilSvg from "@/assets/pencil.svg";

  export let project;
</script>

<style lang="scss">
  .project {
    @include buttonLike;
    padding: 11px 25px;
    display: table;
    width: 100%;
    box-sizing: border-box;

    @media screen and (max-width: $mobileBreak) {
      padding: 11px 25px 11px (25px + $sidebarAdd);
    }

    &:hover {
      background: rgba(0, 0, 0, 0.03);
    }

    > * {
      display: table-cell;
      vertical-align: top;
    }

    .edit {
      float: right;
      @include buttonLike;

      padding-right: 5px;
      padding-top: 3px;
      width: 15px;

      &:hover {
        filter: brightness(0.3);
      }
    }
  }

  .title {
    font-size: $normal;
    user-select: none;
    word-break: break-word;
  }
</style>

<Link toUrl={projectUrl(project)}>
  <div class="project">
    <span class="title">{project.title}</span>
    {#if project.editAccess}
      <span
        class="edit"
        on:click|stopPropagation|preventDefault={() => editProject(project)}>
        {@html pencilSvg}
      </span>
    {/if}
  </div>
</Link>
