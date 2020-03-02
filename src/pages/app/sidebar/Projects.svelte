<script>
  import Hamburger from "@/common/Hamburger";
  import Logo from "@/common/Logo";
  import Link from "@/router/Link";
  import Button from "@/common/Button";
  import Title from "@/common/Title";
  import Project from "./Project";

  import { projects } from "@/manager/projects";
  import { newProject } from "@/manager/layout";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";
  import { allDocumentsUrl, userUrl, orgUrl } from "@/search/search";

  import emitter from "@/emit";

  const emit = emitter({
    retractSidebar() {}
  });
</script>

<style lang="scss">
  .projects {
    padding: 20px 0;

    .titlesection {
      padding: 0 25px;
    }

    .projectcontainer {
      padding: 16px 0;
    }
  }

  .sticky {
    background: $sidebar;
    z-index: $sidebarStickyZ;
  }

  small {
    font-size: 13px;
    color: $gray;
    margin: 0 24px;
    display: block;
  }

  .linksection {
    margin: 20px 0 40px 0;

    :global(a) {
      display: block;
      padding: 5px 24px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.8);

      &.active {
        background: $primary-faded;
      }
    }
  }
</style>

<div class="projects">
  <div class="sticky">
    <Hamburger
      on:toggle={emit.retractSidebar}
      white={false}
      style="padding: 25px;" />
    <Logo />
    <div class="linksection">
      <Link toUrl={allDocumentsUrl()}>
        <div class="link">All Documents</div>
      </Link>
      {#if $orgsAndUsers.me != null}
        <Link toUrl={userUrl($orgsAndUsers.me)}>
          <div class="link">Your Documents</div>
        </Link>
        <Link toUrl={userUrl($orgsAndUsers.me, true)}>
          <div class="link">Your Public Documents</div>
        </Link>
        {#if $orgsAndUsers.me.organization != null && !$orgsAndUsers.me.organization.individual}
          <Link toUrl={orgUrl($orgsAndUsers.me.organization)}>
            <div class="link">
              {$orgsAndUsers.me.organization.name}’s Documents
            </div>
          </Link>
        {/if}
      {/if}
    </div>
    <div class="titlesection">
      <Title small={true}>Projects</Title>
      <Button on:click={newProject} small={true}>+ New Project</Button>
    </div>
  </div>
  <div class="projectcontainer">
    {#if $projects.projects.length > 0}
      {#each $projects.projects as project}
        <Project {project} />
      {/each}
    {:else}
      <small>Create your first project by clicking “New Project” above.</small>
    {/if}
  </div>
</div>
