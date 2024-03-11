<script lang="ts">
  import { _ } from "svelte-i18n";
  import { filter, FILTERS } from "./browser";
  import Filter from "../../common/Filter.svelte";
  import Pin from "../../common/icons/Pin.svelte";
  import Star from "../../common/icons/Star.svelte";
  import Infinity from "svelte-octicons/lib/Infinity16.svelte";
  import Premium from "../../common/icons/Premium.svelte";

  const icons = {
    all: Infinity,
    active: Pin,
    featured: Star,
    premium: Premium,
  };
</script>

<ul class="filters">
  {#each FILTERS as [id, name]}
    <li {id} class:selected={$filter.includes(id)}>
      <Filter {name} selected={$filter.includes(id)}>
        <input slot="input" type="radio" value={id} bind:group={$filter} />
        <span slot="icon"><svelte:component this={icons[id]} /></span>
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
