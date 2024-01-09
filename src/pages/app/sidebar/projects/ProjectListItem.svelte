<script lang="ts">
  import Pencil16 from "svelte-octicons/lib/Pencil16.svelte";
  import ListItem from "../ListItem.svelte";
  import { FileDirectoryFill16 } from "svelte-octicons";

  export let title;
  export let onEditClick;
</script>

<ListItem label={title}>
  <span slot="icon" class="folder"><FileDirectoryFill16 /></span>
  <span slot="action">
    {#if onEditClick}
      <button
        class="edit"
        on:click|stopPropagation|preventDefault={onEditClick}
      >
        <Pencil16 />
      </button>
    {/if}
  </span>
</ListItem>

<style>
  .project {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.25rem 0.75rem;
    box-sizing: border-box;
  }

  .project:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  .folder {
    fill: var(--primary);
  }

  .title {
    line-height: 2rem;
    flex: 1 1 auto;
    max-width: 100%;
    font-size: var(--normal);
    font-weight: 600;
    user-select: none;
    word-break: break-word;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .edit {
    flex: 0 0 2rem;
    padding: 0.25rem;
    height: 1.25rem;
    width: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    appearance: none;
    fill: var(--primary);
    background: transparent;
    border: none;
    border-radius: 1rem;
    cursor: pointer;
  }

  .edit:hover {
    fill: var(--white);
    background: var(--primary);
  }
</style>
