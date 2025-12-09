<script lang="ts">
  import { clean } from "$lib/utils/markup";

  export let title: string = "";
  export let segments: string[] = [];
  export let inlineTitle: boolean = false;
</script>

<div class="container" class:inlineTitle>
  {#if title}<h4 class="ellipsis">{@html clean(title)}</h4>{/if}
  {#if segments?.length > 0}
    <blockquote>
      {#each segments as segment}
        <p class="segment">{@html clean(segment, { allowedTags: ["em"] })}</p>
      {/each}
    </blockquote>
  {/if}
</div>

<style>
  .container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .container blockquote {
    margin: 0;
    padding: 0;
    font-size: var(--font-sm);
    overflow: hidden;
  }
  .container h4 {
    color: var(--gray-4);
    font-weight: var(--font-semibold);
    font-size: var(--font-sm);
    /* margin-bottom: 0.5rem; */
  }
  .segment {
    margin-bottom: 0.5rem;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .container :global(em) {
    border-radius: 0.125rem;
    background-color: var(--yellow-2);
    box-shadow: 0 0 0 0.125rem var(--yellow-2);
    font-style: normal;
  }
  .container.inlineTitle {
    flex-direction: row;
  }
  .container.inlineTitle h4 {
    flex: 0 0 4rem;
  }
</style>
