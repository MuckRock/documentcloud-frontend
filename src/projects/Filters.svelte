<script lang="ts" context="module">
  import { _ } from "svelte-i18n";
  import { writable, type Writable } from "svelte/store";
  import Filter from "../common/Filter.svelte";
  import { Globe16, People16, Person16, SvgComponent } from "svelte-octicons";

  export type FilterKey = keyof typeof FILTERS;

  const FILTERS = {
    user: "Your Projects",
    shared: "Shared with you",
    public: "Public Projects",
  };

  const filterIcons: Record<FilterKey, typeof SvgComponent> = {
    public: Globe16,
    user: Person16,
    shared: People16,
  };

  export const filter: Writable<FilterKey> = writable("user");
</script>

<ul class="filters">
  {#each Object.entries(FILTERS) as [id, name]}
    <li {id} class:selected={$filter === id}>
      <Filter {name} selected={$filter === id}>
        <input slot="input" type="radio" value={id} bind:group={$filter} />
        <span class="icon" slot="icon">
          <svelte:component this={filterIcons[id]} />
        </span>
      </Filter>
    </li>
  {/each}
</ul>

<style>
  ul {
    list-style: none;
    margin-block-start: 0;
    padding-inline-start: 0;
  }

  ul li {
    margin-bottom: 0.25em;
  }

  .icon {
    width: 1em;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #all [slot="icon"] {
    display: flex;
    align-items: center;
  }

  #all:not(.selected) [slot="icon"] {
    fill: var(--primary);
  }

  #active:not(.selected) [slot="icon"] {
    fill: palevioletred;
  }

  #featured:not(.selected) [slot="icon"] {
    fill: orange;
  }

  #premium:not(.selected) [slot="icon"] {
    fill: var(--premium);
  }
</style>
