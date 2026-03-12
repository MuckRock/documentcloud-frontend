<!-- SortChip renders a "sort" atom node. -->
<script lang="ts">
  interface Props {
    field?: string;
    direction?: "asc" | "desc";
  }

  let { field = "", direction = "asc" }: Props = $props();

  let arrow = $derived(direction === "desc" ? "\u2193" : "\u2191");
  let chipLabel = $derived(`Sort by ${field}, ${direction === "desc" ? "descending" : "ascending"}`);
</script>

<span class="search-chip search-sort" aria-label={chipLabel}>
  <span class="chip-label">Sort</span>
  <span class="chip-field">{field}</span>
  <span class="chip-direction">{arrow}</span>
</span>

<style>
  .search-chip.search-sort {
    background-color: var(--purple-1);
    border: 1px solid var(--purple-2);
    color: var(--purple-5);
  }

  .chip-label {
    opacity: 0.7;
    margin: 0 0.125rem 0 0;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    font-weight: 600;
    font-size: var(--font-xs, 12px);
  }

  .chip-direction {
    margin-left: 2px;
  }
</style>
