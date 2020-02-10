<script>
  import { Svue } from "svue";
  import { editProject } from "@/manager/layout";
  import pencilSvg from "@/assets/pencil.svg";

  export let project;
</script>

<style lang="scss">
  .project {
    @include buttonLike;
    padding: 11px 25px;

    &:hover {
      background: rgba(0, 0, 0, 0.03);
    }

    > * {
      display: inline-block;
      vertical-align: middle;
    }

    .edit {
      @include buttonLike;

      margin-right: 5px;

      &:hover {
        filter: brightness(0.3);
      }
    }
  }

  .title {
    font-size: $normal;
  }

  // .sub {
  //   font-size: $small;
  //   line-height: 15px;
  //   color: $gray;
  // }
</style>

<div class="project" on:click={() => console.log('hi')}>
  <span class="edit" on:click|stopPropagation={() => editProject(project)}>
    {@html pencilSvg}
  </span>
  <span class="title">{project.title}</span>
</div>
