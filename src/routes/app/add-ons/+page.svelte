<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  import { _ } from "svelte-i18n";
  import { Hourglass24, Plug24 } from "svelte-octicons";

  import Paginator from "@/common/Paginator.svelte";
  import Search from "@/lib/components/inputs/Search.svelte";
  import Pin from "@/common/icons/Pin.svelte";
  import Star from "@/common/icons/Star.svelte";
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import MainLayout from "$lib/components/layouts/MainLayout.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Error from "@/lib/components/common/Error.svelte";
  import ListItem from "$lib/components/addons/AddOnListItem.svelte";
  import AddOnsNavigation from "$lib/components/addons/AddOnsNavigation.svelte";
  import Tip from "@/lib/components/common/Tip.svelte";
  import Premium from "@/common/icons/Premium.svelte";

  export let data;

  // TODO: Improve cursor handling in page data responses
  /** The pagination URL provided in the reponse corresponds to an API query.
   *  This gets the cursor from the pagination URL and uses it to update the
   *  current URL's searchParams value (there should be a smarter way to do this).
   */
  function paginate(pageUrl: string) {
    const url = new URL($page.url); // make a copy
    const cursor = new URL(pageUrl).searchParams.get("cursor");
    if (!cursor) return;
    url.searchParams.set("cursor", cursor);
    goto(url);
  }

  function search(event: SubmitEvent) {
    event.preventDefault();
    const url = new URL($page.url); // make a copy
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const query = formData.get("query") ?? "";
    if (!query) return;
    url.searchParams.set("query", query as string);
    goto(url);
  }

  $: active =
    Array.from(($page.url as URL).searchParams.entries()).find(
      ([_, value]) => value === "true",
    )?.[0] ??
    ($page.url as URL).searchParams.get("category") ??
    "all";
  $: showTip = ["active", "featured", "premium"].includes(active);

  $: query = ($page.url as URL).searchParams.get("query") ?? "";
</script>

<MainLayout>
  <AddOnsNavigation {active} slot="navigation" />

  <svelte:fragment slot="content">
    <ContentLayout>
      <PageToolbar slot="header">
        <Search name="query" {query} on:submit={search} slot="center" />
      </PageToolbar>
      {#if showTip}
        <div class="tip">
          {#if active === "active"}
            <Tip
              --background-color="var(--orange-light)"
              --border-color="var(--orange)"
              --fill="var(--orange-dark)"
            >
              <Pin size={1.75} slot="icon" />
              {$_("addonBrowserDialog.pinnedTip")}
            </Tip>
          {:else if active === "featured"}
            <Tip
              --background-color="var(--yellow-light)"
              --border-color="var(--yellow)"
              --fill="var(--yellow-dark)"
            >
              <Star size={1.75} slot="icon" />
              {$_("addonBrowserDialog.featuredTip")}
            </Tip>
          {:else if active === "premium"}
            <Tip
              --background-color="var(--green-light)"
              --border-color="var(--green)"
              --fill="var(--green-dark)"
            >
              <Premium size={1.75} slot="icon" />
              {$_("addonBrowserDialog.premiumTip")}
            </Tip>
          {/if}
        </div>
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
              has_next={Boolean(page.next)}
              has_previous={Boolean(page.previous)}
              on:next={() => paginate(page.next)}
              on:previous={() => paginate(page.previous)}
            />
          {/await}
        </svelte:fragment>
      </PageToolbar>
    </ContentLayout>
  </svelte:fragment>
</MainLayout>

<style>
  .tip {
    margin: 1rem;
  }
</style>
