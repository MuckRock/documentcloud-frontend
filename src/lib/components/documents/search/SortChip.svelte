<!--
  SortChip: Renders a sort atom node as a chip.
  Shows "Sort:" label, field name, and direction arrow.
-->
<script lang="ts">
  export let field: string = "";
  export let direction: "asc" | "desc" = "asc";

  $: arrow = direction === "desc" ? "\u2193" : "\u2191";
</script>

<span class="search-chip search-sort">
  <span class="chip-label">Sort:</span>
  <span class="chip-field">{field}</span>
  <span class="chip-direction">{arrow}</span>
</span>

<style>
  .chip-label {
    opacity: 0.7;
    margin-right: 2px;
  }

  .chip-direction {
    margin-left: 2px;
  }
</style>
