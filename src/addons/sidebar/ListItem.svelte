<script lang="ts">
  export let href: string;
  export let label: string;
</script>

<style>
  .list-item {
    display: flex;
    justify-content: flex-start;
    gap: 0.5em;
    padding: 0.25em 0.5em;
    border-radius: var(--radius);
    overflow: hidden;
  }

  .list-item:hover {
    background-color: var(--menuBg);
  }

  .icon {
    margin-top: 0.15em;
  }

  h4 {
    margin: 0;
    font-weight: 600;
  }
</style>

<a class="list-item" {href}>
  {#if $$slots.icon}<div class="icon"><slot name="icon" /></div>{/if}
  <h4>{label}</h4>
</a>
