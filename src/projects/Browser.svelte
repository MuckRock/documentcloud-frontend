<script lang="ts">
  import { Project } from "../api/types/project";
  import Drawer from "../common/Drawer.svelte";
  import { baseApiUrl } from "../api/base";
  import Search, { query } from "../common/SearchInput.svelte";
  import Flex from "../common/Flex.svelte";
  import Paginator from "../common/Paginator.svelte";
  import ProjectList from "./ProjectList.svelte";

  let drawer: Drawer;

  export let visible: boolean = false;

  function buildUrl(route: string, { query = "", filters = {}, per_page = 5 }) {
    const u = new URL(route, baseApiUrl);

    u.search = new URLSearchParams({
      query,
      per_page: String(per_page),
      ...filters,
    }).toString();

    return u.toString();
  }

  $: url = buildUrl("projects/", { query: $query });
  $: next_url = res.next ? new URL(res.next).toString() : null;
  $: previous_url = res.previous ? new URL(res.previous).toString() : null;
  $: items = res.results;

  /** Network logic */
  let loading = false;
  let error = null;
  let res: {
    next?: string | null;
    previous?: string | null;
    results?: Project[];
  } = {};
  const options: RequestInit = {
    credentials: "include",
  };

  export async function load(url) {
    loading = true;

    res = await fetch(url, options)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw data;
        return data;
      })
      .catch((err) => {
        error = err;
        loading = false;
        return {};
      });

    loading = false;
  }

  $: if (visible) {
    load(url);
  }
  $: loadNext = () => load(next_url);
  $: loadPrev = () => load(previous_url);
  $: reload = () => load(url);
</script>

<Drawer bind:this={drawer} bind:visible anchor="right" on:open on:close>
  <div slot="content" class="browser">
    <header class="header">
      <h2>Projects</h2>
    </header>
    <aside class="sidebar">
      <div class="search"><Search /></div>
    </aside>
    <Flex as="main" direction="column" class="results">
      <Flex direction="column" class="list">
        <ProjectList {loading} {error} {items} bind:reload />
      </Flex>
      <Paginator
        has_next={Boolean(next_url)}
        has_previous={Boolean(previous_url)}
        on:next={loadNext}
        on:previous={loadPrev}
      />
    </Flex>
  </div>
</Drawer>

<style>
  .browser {
    display: grid;
    grid-template-columns: 1fr 3fr;
    grid-template-rows: auto 1fr;
    gap: 1em;
    padding: 1em 1em 0;
    height: 100%;
    width: 100%;
    max-width: 44em;
    box-sizing: border-box;
  }
  .header {
    grid-column: span 2;
    display: flex;
    flex-direction: column;
    align-items: baseline;
    gap: 0.5em;
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
