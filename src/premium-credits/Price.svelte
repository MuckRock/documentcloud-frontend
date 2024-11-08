<script lang="ts">
  import Credit from "../lib/components/icons/Credit.svelte";

  export let value: number;
  export let iconSize = 1;
</script>

<span class="price">
  <span class="flex-auto center-self"><Credit size={iconSize} /></span>
  <span class="flex-grow flex-auto">{value?.toLocaleString()}</span>
</span>

<style>
  .price {
    display: inline-flex;
    align-items: baseline;
    gap: 0.125rem;
    font-weight: 600;
  }
  .flex-grow {
    flex-grow: 1;
  }
  .center-self {
    align-self: center;
  }
  .flex-auto {
    flex-basis: auto;
  }
</style>
