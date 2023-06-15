<script context="module">
  import { writable } from "svelte/store";

  export const filters = writable([]);

  export const FILTERS = [
    ["Pinned", "active"],
    ["Featured", "featured"],
  ];
</script>

<style>
  ul {
    list-style: none;
    margin-block-start: 0;
    padding-inline-start: 0;
  }

  ul li {
    margin-bottom: 0.25em;
    padding: 0.25em;
  }

  ul li label {
    cursor: pointer;
  }

  ul li.active::before {
    content: "✓ "; /* todo: use pin svg */
  }

  ul li.featured::before {
    content: "★ ";
  }

  .selected {
    background-color: var(--highlight-orange, #ff785c);
    border: 1px solid var(--gray);
    border-radius: var(--radius, 4px);
  }
</style>

<ul>
  {#each FILTERS as [name, value]}
    <li class={value} class:selected={$filters.includes(value)}>
      <label>
        <input type="checkbox" {value} bind:group={$filters} />
        {name}
      </label>
    </li>
  {/each}
</ul>
