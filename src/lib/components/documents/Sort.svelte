<script lang="ts" context="module">
  export type SortField = "score" | keyof Document;
  export type SortOrder = "asc" | "desc";
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
  import { ChevronDown16, SortAsc16, SortDesc16 } from "svelte-octicons";
  import Dropdown from "../common/Dropdown.svelte";
  import Menu from "../common/Menu.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import type { Document } from "@/lib/api/types";

  export let order: SortOrder;
  export let sort: SortField;
  export let fields: SortField[];
  export let query: string = "";
</script>

<Dropdown>
  <SidebarItem slot="anchor">
    <div class="labelIcon" slot="start">
      {#if order === "asc"}
        <SortAsc16 />
      {:else}
        <SortDesc16 />
      {/if}
    </div>
    {$_("documentBrowser.sort.label")}
    <ChevronDown16 slot="end" />
  </SidebarItem>
  <Menu>
    <div class="field options">
      {#if query}
        <label class="field option" class:active={sort === "score"}>
          <input type="radio" bind:group={sort} value="score" />
          {$_(`documentBrowser.sort.fields.score`)}
        </label>
      {/if}
      {#each fields as f}
        <label class="field option" class:active={sort === f}>
          <input type="radio" bind:group={sort} value={f} />
          {$_(`documentBrowser.sort.fields.${f}`)}
        </label>
      {/each}
    </div>
    <div class="order options">
      <label class="order option desc" class:active={order === "desc"}>
        <SortDesc16 />
        <input type="radio" bind:group={order} value="desc" />
        {$_(`documentBrowser.sort.order.desc`)}
      </label>
      <label class="order option asc" class:active={order === "asc"}>
        <SortAsc16 />
        <input type="radio" bind:group={order} value="asc" />
        {$_(`documentBrowser.sort.order.asc`)}
      </label>
    </div>
  </Menu>
</Dropdown>

<style>
  .labelIcon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .field.options {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  .order.options {
    display: flex;
    gap: 0;
    padding: 0 0.25rem 0.25rem;
  }

  .option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0 0.5rem;

    font-family: "Source Sans Pro";
    font-size: var(--font-sm, 0.875rem);
    font-weight: var(--font-semibold, 600);
    font-style: normal;
    line-height: normal;
  }

  .option input {
    margin: 0;
  }

  .order.option {
    display: flex;
    padding: 0.375rem 0.5rem;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
    flex: 1 0 0;
    border: 1px solid var(--gray-3);
    background: var(--white);

    color: var(--gray-4, #5c717c);
    fill: var(--gray-3, #99a8b3);

    & input {
      display: none;
    }

    &:last-child {
      border-radius: 0rem 0.5rem 0.5rem 0rem;
      border-left: none;
    }

    &:first-child {
      border-radius: 0.5rem 0rem 0rem 0.5rem;
      border-right: none;
    }

    &.active {
      border: 1px solid var(--blue-4, #1367d0);
      color: var(--blue-4, #1367d0);
      fill: var(--blue-3, #4294f0);
      background: var(--blue-1, #eef3f9);
    }
  }
</style>
