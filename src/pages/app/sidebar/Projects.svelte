<script>
  import Button from "@/common/Button";
  import Title from "@/common/Title";
  import Project from "./Project";

  import { projects } from "@/manager/projects";
</script>

<style lang="scss">
  .projects {
    padding: 0;

    .titlesection {
      padding: 0 25px;
    }

    .projectcontainer {
      padding: 16px 0;
    }
  }
</style>

<div class="projects">
  <div class="titlesection">
    <Title small={true}>Projects</Title>
    <Button small={true}>+ New Project</Button>
  </div>
  <div class="projectcontainer">
    {#each $projects.projects as project}
      <Project {project} />
    {/each}
  </div>
</div>
