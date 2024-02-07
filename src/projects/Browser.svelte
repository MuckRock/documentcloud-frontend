<script lang="ts">
  import { Project } from "../api/types/project";
  import Drawer from "../common/Drawer.svelte";
  import { baseApiUrl } from "../api/base";
  import Search, { query } from "../common/SearchInput.svelte";
  import Flex from "../common/Flex.svelte";
  import Paginator from "../common/Paginator.svelte";
  import ProjectList from "./ProjectList.svelte";
  import { newProject } from "../manager/layout";
  import Button from "../common/Button.svelte";
  import { getProjects, getPublicProjects } from "../api/project";
  import { User } from "../api/types";
  import { getMe } from "../api/orgAndUser";
  import Filters, { FilterKey, filter } from "./Filters.svelte";

  let drawer: Drawer;

  export let visible: boolean = false;

  /** Network logic */
  let user: User;
  let projects: Project[] | null;
  let loading = false;
  let error = null;

  let res: {
    next?: string | null;
    previous?: string | null;
    results?: Project[];
  } = {};
  $: next_cursor = res.next
    ? new URL(res.next).searchParams.get("cursor")
    : null;
  $: previous_cursor = res.previous
    ? new URL(res.previous).searchParams.get("cursor")
    : null;
  $: items = res.results;

  export async function load(filter: FilterKey, cursor?: string) {
    loading = true;
    try {
      user = await getMe();
      if (filter === "public") {
        res = await getPublicProjects($query, cursor);
      } else {
        res.results = await getProjects(user.id, $query);
        if (filter === "user") {
          res.results = res.results.filter(
            (project) => project.user === user.id,
          );
        } else {
          res.results = res.results.filter(
            (project) => project.user !== user.id,
          );
        }
      }
    } catch (err) {
      error = err;
      projects = null;
    }
    loading = false;
  }

  $: if (visible) {
    load($filter);
  }
  $: loadNext = () => load($filter, next_cursor);
  $: loadPrev = () => load($filter, previous_cursor);
  $: reload = () => load($filter);
</script>

<Drawer bind:this={drawer} bind:visible anchor="right" on:open on:close>
  <div slot="content" class="browser">
    <header class="header">
      <h2>Projects</h2>
      <Button on:click={newProject}>New Project</Button>
    </header>
    <aside class="sidebar">
      <div class="search"><Search /></div>
      <Filters />
    </aside>
    <Flex as="main" direction="column" class="results">
      <Flex direction="column" class="list">
        <ProjectList {loading} {error} {items} bind:reload />
      </Flex>
      {#if $filter === "public"}
        <Paginator
          has_next={Boolean(next_cursor)}
          has_previous={Boolean(previous_cursor)}
          on:next={loadNext}
          on:previous={loadPrev}
        />
      {/if}
    </Flex>
  </div>
</Drawer>

<style>
  .browser {
    display: grid;
    grid-template-columns: 1fr 3fr;
    grid-template-rows: auto 1fr;
    gap: 1em;
    padding: 1em 1em 0.5em;
    height: 100%;
    width: 100%;
    max-width: 44em;
    box-sizing: border-box;
  }
  .header {
    grid-column: span 2;
    display: flex;
    align-items: baseline;
    gap: 2em;
    margin-right: 2em;
  }
  .header h2 {
    flex: 0 1 auto;
    margin: 0;
  }
  .header p {
    margin: 0;
    font-weight: 600;
    color: gray;
  }
  .sidebar {
    flex: 1 1 12em;
    display: flex;
    flex-direction: column;
  }
  .search {
    margin-bottom: 1em;
  }

  /* Use of :global is required for passing style to Flex component */
  .browser :global(.results) {
    flex: 4 1 24em;
    min-width: 20em;
    min-height: 0;
    max-height: 100%;
  }
  .browser :global(.results > .list) {
    flex: 1 1 24em;
    align-items: center;
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: calc(2 * var(--radius));
    overflow-y: scroll;
  }

  .tip {
    font-size: 0.9em;
    margin: 0.5rem;
    padding: 1rem;
    background-color: var(--primary-faded);
    border-color: var(--primary);
    fill: var(--primary);
    border: 1px solid;
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
    & .icon {
      fill: var(--primary);
    }
    & .message {
      margin: 0;
    }
  }
  .pinned.tip {
    background-color: hsl(341, 35%, 91%);
    border-color: palevioletred;
    & .icon {
      fill: palevioletred;
    }
  }
  .featured.tip {
    background-color: hsl(39, 100%, 91%);
    border-color: orange;
    & .icon {
      fill: orange;
    }
  }
  .premium.tip {
    background-color: hsl(161, 69%, 91%);
    border-color: var(--premium, #24cc99);
    & .icon {
      fill: var(--premium, #24cc99);
    }
  }
</style>
