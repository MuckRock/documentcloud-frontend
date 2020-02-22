<script>
  import Link from "@/router/Link";
  import { editProject } from "@/manager/layout";
  import { projectUrl } from "@/search/search";

  // SVG assets
  import pencilSvg from "@/assets/pencil.svg";

  export let project;
</script>

<style lang="scss">
  :global(a) {
    color: inherit;
    text-decoration: inherit;

    &.active {
      font-weight: normal !important;

      .project {
        $activeBg: $primary-faded;

        background: $activeBg;

        &:hover {
          background: $activeBg;
          opacity: 1;
        }
      }
    }
  }

  .project {
    @include buttonLike;
    padding: 11px 25px;
    display: table;
    width: 100%;
    box-sizing: border-box;

    &:hover {
      background: rgba(0, 0, 0, 0.03);
    }

    > * {
      display: table-cell;
      vertical-align: top;
    }

    .edit {
      @include buttonLike;

      padding-right: 5px;
      width: 15px;

      &:hover {
        filter: brightness(0.3);
      }
    }
  }

  .title {
    font-size: $normal;
    user-select: none;
  }

  // .sub {
  //   font-size: $small;
  //   line-height: 15px;
  //   color: $gray;
  // }
</style>

<Link toUrl={projectUrl(project)}>
  <div class="project">
    <span
      class="edit"
      on:click|stopPropagation|preventDefault={() => editProject(project)}>
      {@html pencilSvg}
    </span>
    <span class="title">{project.title}</span>
  </div>
</Link>
