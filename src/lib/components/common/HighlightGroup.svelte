<!-- @component A collection of highlights from search results.-->

<script lang="ts">
  import { _ } from "svelte-i18n";

  type H = $$Generic;

  export let open = false;
  export let highlights: [string, H][] = [];
  export let getHref: (id: string) => string;
</script>

{#if highlights.length}
  <details class="highlights" bind:open>
    <summary>
      <slot name="summary">
        {$_("search.matchingResults", { values: { n: highlights.length } })}
      </slot>
    </summary>
    <ul>
      {#each highlights as [id, highlight]}
        <li>
          <a class="highlight" href={getHref(id)}>
            <slot {id} {highlight} />
          </a>
        </li>
      {/each}
    </ul>
  </details>
{/if}

<style>
  .highlights {
    border-radius: 0.25rem;
    overflow: hidden;
  }
  .highlights summary {
    color: var(--gray-4);
    padding: 0.5rem 0.75rem;
    font-size: var(--font-sm);
    font-weight: var(--font-semibold);
  }
  .highlights summary::marker {
    margin-right: 1rem;
  }
  .highlights ul {
    list-style-type: none;
    padding: 0;
    margin: 0 0.5rem;
    border: 1px solid var(--gray-1);
    border-radius: 0.25rem;
    background: var(--white);
    overflow: hidden;
  }
  .highlights li {
    border-top: 1px solid var(--gray-1);
  }
  .highlights li:first-child {
    border-top: none;
  }
  .highlight {
    display: block;
    padding: 0.5rem 0.75rem;
    background: var(--white);
    text-decoration: none;
    color: inherit;
  }
  .highlight:hover,
  .highlight:focus {
    background: var(--blue-1);
  }
</style>
