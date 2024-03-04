<script lang="ts">
  import { _ } from "svelte-i18n";
  import AddOnList from "@/addons/browser/AddOnList.svelte";
  import type { AddOnListItem } from "$lib/api/types";
  import { buildParams, buildUrl, filter } from "@/addons/browser/browser";
  import Filters from "@/addons/browser/Filters.svelte";
  import Categories from "@/addons/browser/Categories.svelte";
  import Paginator from "@/common/Paginator.svelte";
  import Search, { query } from "@/common/SearchInput.svelte";
  import Pin from "@/common/icons/Pin.svelte";
  import Star from "@/common/icons/Star.svelte";
  import Credit from "@/common/icons/Credit.svelte";

  let visible = false;
  let per_page = 10;

  export let data;
</script>

<div class="browser">
  <header class="header">
    <h2>{$_("addonBrowserDialog.title")}</h2>
    <p>{$_("addonBrowserDialog.subtitle")}</p>
  </header>
  <aside class="sidebar">
    <div class="search"><Search /></div>
    <div class="filters">
      <Filters />
      <Categories />
    </div>
  </aside>
  <main class="results">
    <div class="list">
      {#if $filter === "active"}
        <aside class="pinned tip">
          <div class="icon"><Pin size={1.75} /></div>
          <p class="message">{$_("addonBrowserDialog.pinnedTip")}</p>
        </aside>
      {:else if $filter === "featured"}
        <aside class="featured tip">
          <div class="icon"><Star size={1.75} /></div>
          <p class="message">{$_("addonBrowserDialog.featuredTip")}</p>
        </aside>
      {:else if $filter === "premium"}
        <aside class="premium tip">
          <div class="icon"><Credit badge size={1.75} /></div>
          <p class="message">{$_("addonBrowserDialog.premiumTip")}</p>
        </aside>
      {/if}
      {#await data.addons then res}
        <AddOnList
          loading={false}
          items={res.items}
          error={null}
          reload={null}
        />
      {/await}
    </div>
    <!-- <div class="pagination">
      <Paginator
        has_next={Boolean(next_url)}
        has_previous={Boolean(previous_url)}
        on:next={loadNext}
        on:previous={loadPrev}
      />
    </div> -->
  </main>
</div>
