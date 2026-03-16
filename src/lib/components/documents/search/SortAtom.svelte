<!-- SortAtom renders a "sort" atom node. -->
<script lang="ts">
  import { sortLabel } from "./utils/label";

  interface Props {
    field?: string;
    direction?: "asc" | "desc";
  }

  let { field = "", direction = "asc" }: Props = $props();

  let arrow = $derived(direction === "desc" ? "\u2193" : "\u2191");
  let atomLabel = $derived(sortLabel({ field, direction }));
</script>

<span class="search-atom search-sort" aria-label={atomLabel}>
  <span class="atom-label">Sort</span>
  <span class="atom-field">{field}</span>
  <span class="atom-direction">{arrow}</span>
</span>

<style>
  .search-atom.search-sort {
    background-color: var(--purple-1);
    border: 1px solid var(--purple-2);
    color: var(--purple-5);
  }

  .atom-label {
    opacity: 0.7;
    margin: 0 0.125rem 0 0;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    font-weight: 600;
    font-size: var(--font-xs, 12px);
  }

  .atom-direction {
    margin-left: 2px;
  }
</style>
