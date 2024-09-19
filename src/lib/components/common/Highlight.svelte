<script lang="ts">
  import DOMPurify from "isomorphic-dompurify";

  export let title: string = "";
  export let segments: string[] = [];

  function sanitize(s: string): string {
    return DOMPurify.sanitize(s, { ALLOWED_TAGS: ["em"] });
  }
</script>

<div class="container">
  {#if title}<h4 class="ellipsis">{@html sanitize(title)}</h4>{/if}
  {#if segments.length > 0}
    <blockquote>
      {#each segments as segment}
        <p class="segment ellipsis">{@html sanitize(segment)}</p>
      {/each}
    </blockquote>
  {/if}
</div>

<style>
  .container {
    width: 100%;
  }
  .container blockquote {
    margin: 0;
    padding: 0;
    font-size: var(--font-sm);
    overflow: hidden;
  }
  .container h4 {
    flex: 0 0 4rem;
    color: var(--gray-4);
    font-weight: var(--font-semibold);
    font-size: var(--font-sm);
    margin-bottom: 0.5rem;
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
</style>
