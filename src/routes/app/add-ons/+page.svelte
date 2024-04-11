<script lang="ts">
  import { goto } from "$app/navigation";
  import { _ } from "svelte-i18n";
  import { Hourglass24, Plug24 } from "svelte-octicons";

  import Paginator from "@/common/Paginator.svelte";
  import Search, { query } from "@/common/SearchInput.svelte";
  import Pin from "@/common/icons/Pin.svelte";
  import Star from "@/common/icons/Star.svelte";
  import Credit from "@/common/icons/Credit.svelte";
  import ContentLayout from "$lib/components/ContentLayout.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import MainLayout from "$lib/components/MainLayout.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Error from "@/lib/components/common/Error.svelte";
  import ListItem from "$lib/components/addons/AddOnListItem.svelte";
  import AddOnsNavigation from "@/lib/components/addons/AddOnsNavigation.svelte";

  export let data;

  // TODO: Improve cursor handling in page data responses
  /** The pagination URL provided in the reponse corresponds to an API query.
   *  This gets the cursor from the pagination URL and uses it to update the
   *  current URL's searchParams value (there should be a smarter way to do this).
   */
  function paginate(pageUrl: string) {
    const { url } = data;
    const cursor = new URL(pageUrl).searchParams.get("cursor");
    if (!cursor) return;
    url.searchParams.set("cursor", cursor);
    goto(url);
  }

  $: active =
    Array.from((data.url as URL).searchParams.entries()).find(
      ([_, value]) => value === "true",
    )?.[0] ?? "all";
</script>

<MainLayout>
  <AddOnsNavigation {active} slot="navigation" />

  <svelte:fragment slot="content">
    <ContentLayout>
      <PageToolbar slot="header">
        <Search slot="center" />
      </PageToolbar>

      {#if active === "active"}
        <aside class="pinned tip">
          <div class="icon"><Pin size={1.75} /></div>
          <p class="message">{$_("addonBrowserDialog.pinnedTip")}</p>
        </aside>
      {:else if active === "featured"}
        <aside class="featured tip">
          <div class="icon"><Star size={1.75} /></div>
          <p class="message">{$_("addonBrowserDialog.featuredTip")}</p>
        </aside>
      {:else if active === "premium"}
        <aside class="premium tip">
          <div class="icon"><Credit badge size={1.75} /></div>
          <p class="message">{$_("addonBrowserDialog.premiumTip")}</p>
        </aside>
      {/if}
      {#await data.addons}
        <Empty icon={Hourglass24}>Loading…</Empty>
      {:then page}
        {#each page.results as addon}
          <ListItem {addon} />
        {:else}
          <Empty icon={Plug24}>No Add-Ons Found</Empty>
        {/each}
      {:catch error}
        <Error>{String(error)}</Error>
      {/await}

      <PageToolbar slot="footer">
        <svelte:fragment slot="center">
          {#await data.addons}
            <Paginator />
          {:then page}
            <Paginator
              has_next={Boolean(page.next_url)}
              has_previous={Boolean(page.previous_url)}
              on:next={() => paginate(page.next_url)}
              on:previous={() => paginate(page.previous_url)}
            />
          {/await}
        </svelte:fragment>
      </PageToolbar>
    </ContentLayout>
  </svelte:fragment>
</MainLayout>

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
  .results {
    flex: 4 1 24em;
    min-width: 20em;
    min-height: 0;
    max-height: 100%;
    display: flex;
    flex-direction: column;
  }
  .results .list {
    flex: 1 1 24em;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: calc(2 * var(--radius));
    overflow-y: scroll;
  }
  .results .pagination {
    flex: 0 0 auto;
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
