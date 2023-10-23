<script lang="ts">
  export let label: string;
</script>

<style>
  .title {
    display: flex;
    align-items: center;
  }
  .label {
    flex: 1 1 auto;
    pointer-events: none;
  }
  .icon {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    margin-right: 0.2em;
    overflow: hidden;
  }
  .dropper {
    margin-bottom: -0.25em;
    opacity: 0.5;
  }
</style>

<span class="title">
  {#if $$slots.icon}<span class="icon"><slot name="icon" /></span>{/if}
  <span class="label">{label}</span>
  <span class="dropper">▼</span>
</span>
