<script>
  import Hamburger from "@/common/Hamburger";
  import Logo from "@/common/Logo";
  import Button from "@/common/Button";
  import Title from "@/common/Title";
  import Project from "./Project";

  import { projects } from "@/manager/projects";
  import { newProject } from "@/manager/layout";
  import emitter from "@/emit";

  const emit = emitter({
    retractSidebar() {}
  });
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

  .sticky {
    position: sticky;
    top: 0;
    background: $sidebar;
    z-index: $sidebarStickyZ;
  }
</style>

<div class="projects">
  <div class="sticky">
    <Hamburger
      on:toggle={emit.retractSidebar}
      white={false}
      style="padding: 25px;" />
    <Logo />
    <div class="titlesection">
      <Title small={true}>Projects</Title>
      <Button on:click={newProject} small={true}>+ New Project</Button>
    </div>
  </div>
  <div class="projectcontainer">
    {#each $projects.projects as project}
      <Project {project} />
    {/each}
  </div>
</div>
