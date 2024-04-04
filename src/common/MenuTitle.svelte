<script lang="ts">
  import { ChevronDown16 } from "svelte-octicons";

  export let label: string;
</script>

<span class="title">
  {#if $$slots.icon}<span class="icon"><slot name="icon" /></span>{/if}
  <span class="label">{label}</span>
  <span class="dropper"><ChevronDown16 /></span>
</span>

<style>
  .title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .label {
    flex: 1 1 auto;
    pointer-events: none;
  }
  .icon {
    flex: 0 0 auto;
    /* background-color: rgba(255, 255, 255, 0.1); */
    border-radius: 50%;
    margin-right: 0.325em;
    overflow: hidden;
  }
  .dropper {
    margin-bottom: -0.25em;
    opacity: 0.5;
  }
</style>
