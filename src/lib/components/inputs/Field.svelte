<script lang="ts">
  export let title: string = "";
  export let description: string = "";
  export let inline = false;
  export let required = false;
</script>

<div class="field" class:inline class:required>
  <label>
    {#if title}
      <span class="title">{title}</span>
    {/if}
    <slot />
  </label>
  {#if description}
    <p class="help">{@html description}</p>
  {/if}
</div>

<style>
  .field {
    display: block;
    flex: 1 1 auto;
  }
  .field label {
    gap: 0.5em;
    display: flex;
    flex-direction: column;
  }
  .title {
    flex: 1 1 100%;
    font-weight: var(--font-semibold, 600);
  }
  .help {
    margin: 0.5rem 0;
    font-size: var(--font-sm, 0.875em);
    color: var(--gray-3);
  }
  .inline.field {
    width: 100%;
  }
  .inline.field label {
    flex-direction: row;
    align-items: center;
  }
  .inline.field .title {
    flex: 0 1 auto;
  }
  .required.field .title:after {
    content: "*";
    color: var(--caution);
  }
</style>
