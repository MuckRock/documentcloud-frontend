<script lang="ts">
  import ListItem from "../ListItem.svelte";
  import Pin from "../../../../common/icons/Pin.svelte";
  import EditButton from "../../../../common/EditButton.svelte";

  export let title;
  export let onEditClick;
</script>

<ListItem label={title}>
  <span slot="icon" class="pin"><Pin /></span>
  <span slot="action">
    {#if onEditClick}
      <EditButton small title={`Edit ${title}`} on:click={onEditClick} />
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

  .pin {
    fill: var(--highlight-orange);
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
</style>
