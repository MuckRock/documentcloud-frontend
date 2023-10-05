<script lang="ts">
  import Credit from "../common/icons/Credit.svelte";

  export let value: number;
</script>

<style>
  .price {
    display: inline-flex;
    align-items: center;
    gap: 0.125rem;
    font-weight: 600;
  }
  .flex-grow {
    flex-grow: 1;
  }
  .flex-auto {
    flex-basis: auto;
  }
</style>

<span class="price">
  <span class="flex-auto"><Credit /></span>
  <span class="flex-grow flex-auto">{value?.toLocaleString()}</span>
</span>
