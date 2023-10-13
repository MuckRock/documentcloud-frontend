<script lang="ts">
  export let label: string;
</script>

<style>
  .title {
    display: flex;
    align-items: center;
  }
  .label {
    pointer-events: none;
  }
  .icon {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    margin-right: 0.25em;
  }
  .dropper {
    margin-bottom: -0.25em;
    color: rgba(0, 0, 0, 0.5);
  }
</style>

<span class="title">
  {#if $$slots.icon}<span class="icon"><slot name="icon" /></span>{/if}
  <span class="label">{label}</span>
  <span class="dropper">▼</span>
</span>
